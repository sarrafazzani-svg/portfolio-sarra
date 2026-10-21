/* Admin dashboard: uses the same portfolioProjects localStorage key as script.js.
   Open index.html and admin.html from the SAME localhost origin for shared data. */

   
   let isLoggedIn = false;
   let editingProjectId = null;
   let projects = [];
   let profile = {};
   let contactSettings = {};
   
   // Don't hardcode credentials - they'll come from the server
   const $ = (id) => document.getElementById(id);
   
   function togglePassword(fieldId) {
     const field = $(fieldId);
     if (!field) return;
     field.type = field.type === 'password' ? 'text' : 'password';
   }
   
   function getDefaultProfile() {
     return {
       name: 'Your Name',
       position: 'Multimedia Artist',
       bio: 'Creative multimedia artist dedicated to creating innovative visual experiences.',
       email: 'your@email.com'
     };
   }
   
   function getDefaultContactSettings() {
     return {
       email: 'your@email.com',
       location: '',
       socialLinks: []
     };
   }
   
   function loadProfile() {
     try {
       profile = JSON.parse(localStorage.getItem('portfolioProfile') || 'null') || getDefaultProfile();
     } catch {
       profile = getDefaultProfile();
     }
     saveProfile();
   }
   
   function loadContactSettings() {
     try {
       const stored = localStorage.getItem('portfolioContacts');
       if (stored) {
         contactSettings = JSON.parse(stored);
       } else {
         contactSettings = getDefaultContactSettings();
       }
     } catch (error) {
       console.error('Error loading contact settings:', error);
       contactSettings = getDefaultContactSettings();
     }
   }
   
   function saveProfile() {
     localStorage.setItem('portfolioProfile', JSON.stringify(profile));
   }
   
   function saveContactSettings() {
     localStorage.setItem('portfolioContacts', JSON.stringify(contactSettings));
   }
   
   function displayProfile() {
     if (!$('profileName')) return;
     $('profileName').value = profile.name || '';
     $('profilePosition').value = profile.position || '';
     $('profileBio').value = profile.bio || '';
     $('profileEmail').value = profile.email || '';
   }
   
   function displayContactSettings() {
     if (!$('contactEmail')) return;
     $('contactEmail').value = contactSettings.email || '';
     $('contactLocation').value = contactSettings.location || '';
     
     const container = $('socialLinksContainer');
     if (!container) return;
     
     container.innerHTML = '';
     if (contactSettings.socialLinks && contactSettings.socialLinks.length > 0) {
       contactSettings.socialLinks.forEach((link) => {
         addSocialLinkUI(link.platform, link.url);
       });
     }
   }
   
   $('profileForm')?.addEventListener('submit', (e) => {
     e.preventDefault();
     profile = {
       name: $('profileName').value.trim(),
       position: $('profilePosition').value.trim(),
       bio: $('profileBio').value.trim(),
       email: $('profileEmail').value.trim()
     };
     saveProfile();
     showToast('Profile saved.');
   });
   
   $('contactsForm')?.addEventListener('submit', async (e) => {
     e.preventDefault();
     
     const email = $('contactEmail').value.trim();
     const location = $('contactLocation').value.trim();
     
     if (!email) {
       showToast('Email is required.', 'error');
       return;
     }
     
     // Collect social links
     const socialLinks = [];
     document.querySelectorAll('.social-link-item').forEach(item => {
       const platform = item.querySelector('.social-platform')?.value.trim();
       const url = item.querySelector('.social-url')?.value.trim();
       if (platform && url) {
         socialLinks.push({ platform, url });
       }
     });
     
     // Save to localStorage first
     contactSettings = {
       email,
       location,
       socialLinks
     };
     saveContactSettings();
     
     // Try to save to server
     const button = e.target.querySelector('button[type="submit"]');
     button.disabled = true;
     const oldText = button.textContent;
     button.textContent = 'Saving...';
     
     try {
       const token = localStorage.getItem('adminToken') || '';
       const response = await fetch('/api/admin/contact-settings', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           email,
           location,
           socialLinks
         })
       });
       
       if (response.ok) {
         const data = await response.json();
         showToast('Contact settings saved!');
       } else {
         throw new Error('Server error');
       }
     } catch (error) {
       console.error('Error saving to server:', error);
       // Already saved locally, so show success
       showToast('Contact settings saved locally!');
     } finally {
       button.disabled = false;
       button.textContent = oldText;
     }
   });
   
   function addSocialLink() {
     addSocialLinkUI('', '', contactSettings.socialLinks?.length || 0);
   }
   
   function addSocialLinkUI(platform = '', url = '') {
     const container = $('socialLinksContainer');
     const itemId = 'social-' + Date.now() + Math.random();
     
     const html = `
       <div class="social-link-item" id="${itemId}">
         <div class="form-group">
           <label>Platform</label>
           <input type="text" placeholder="Platform (e.g., Instagram, LinkedIn, Behance, GitHub)" value="${safeText(platform)}" class="social-platform">
         </div>
         <div class="form-group">
           <label>URL</label>
           <input type="url" placeholder="https://..." value="${safeText(url)}" class="social-url">
         </div>
         <button type="button" class="btn-remove-social" onclick="removeSocialLink('${itemId}')">Remove</button>
       </div>
     `;
     
     container.insertAdjacentHTML('beforeend', html);
   }
   
   function removeSocialLink(itemId) {
     const item = $(itemId);
     if (item) {
       item.remove();
     }
   }
   
   function loadProjects() {
     try {
       const stored = localStorage.getItem('portfolioProjects');
       projects = stored ? JSON.parse(stored) : [];
       if (!Array.isArray(projects)) projects = [];
     } catch (error) {
       console.error('Could not read portfolioProjects:', error);
       projects = [];
     }
   }
   
   // If the existing Node server already has projects in projects.json, import them
   // once when browser storage is empty. This keeps the unchanged portfolio script working.
   async function loadProjectsWithServerFallback() {
     loadProjects();
     if (projects.length) return;
   
     try {
       const response = await fetch('/api/projects');
       if (!response.ok) return;
       const serverProjects = await response.json();
       if (Array.isArray(serverProjects) && serverProjects.length) {
         projects = serverProjects;
         saveProjectsToStorage();
       }
     } catch (error) {
       // API fallback is optional; localStorage remains the primary shared store.
       console.info('No local project API available; using browser storage.', error);
     }
   }
   
   function saveProjectsToStorage() {
     try {
       localStorage.setItem('portfolioProjects', JSON.stringify(projects));
       return true;
     } catch (error) {
       console.error(error);
       showToast('Could not save to browser storage. Storage may be full.', 'error');
       return false;
     }
   }
   
   function showToast(message, type = 'success') {
     const toast = $('adminToast');
     if (!toast) { alert(message); return; }
     toast.textContent = message;
     toast.className = `admin-toast show ${type === 'success' ? '' : type}`;
     toast.style.display = 'block';
     window.clearTimeout(showToast.timer);
     showToast.timer = window.setTimeout(() => {
       toast.classList.remove('show');
       toast.style.display = 'none';
     }, 3200);
   }
   
   $('loginForm')?.addEventListener('submit', async (e) => {
     e.preventDefault();
     const username = $('username').value.trim();
     const password = $('password').value;
   
     // Validate credentials with the server
     try {
       const response = await fetch('/api/admin/login', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ username, password })
       });
       
       if (!response.ok) {
         showToast('Invalid username or password.', 'error');
         $('password').value = '';
         return;
       }
       
       const data = await response.json();
       
       // Store secure token
       localStorage.setItem('adminToken', data.token || 'admin-session-' + Date.now());
       
       isLoggedIn = true;
       $('loginPage').style.display = 'none';
       $('adminDashboard').style.display = 'block';
       $('currentUser').textContent = username;
       await loadProjectsWithServerFallback();
       loadProfile();
       loadContactSettings();
       displayProjects();
       displayProfile();
       loadMessages();
       showSection('projects');
       showToast('Logged in successfully!');
     } catch (error) {
       console.error('Login error:', error);
       showToast('Login failed. Please try again.', 'error');
       $('password').value = '';
     }
   });
   
   function logout() {
     if (!confirm('Log out of the dashboard?')) return;
     isLoggedIn = false;
     editingProjectId = null;
     $('adminDashboard').style.display = 'none';
     $('loginPage').style.display = 'flex';
     $('loginForm').reset();
   }
   
   function showSection(sectionName, clickedButton) {
     const pane = $(sectionName);
     if (!pane) return;
   
     document.querySelectorAll('.tab-pane').forEach((el) => el.classList.remove('active'));
     document.querySelectorAll('.admin-nav-item').forEach((el) => el.classList.remove('active'));
     pane.classList.add('active');
   
     const button = clickedButton || [...document.querySelectorAll('.admin-nav-item')]
       .find((el) => (el.getAttribute('onclick') || '').includes(`'${sectionName}'`));
     if (button) button.classList.add('active');
   
     if (sectionName === 'profile') displayProfile();
     if (sectionName === 'contacts') displayContactSettings();
     if (sectionName === 'projects') {
       loadProjects();
       displayProjects();
     }
     if (sectionName === 'messages') {
       loadMessages();
     }
     if (sectionName === 'add' && !editingProjectId) resetForm();
   }
   
   function safeText(value) {
     return String(value ?? '').replace(/[&<>"']/g, (char) => ({
       '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
     })[char]);
   }
   
   function displayProjects() {
     const container = $('projectsList');
     if (!container) return;
     if (!projects.length) {
       container.innerHTML = `
         <div class="empty-state">
           <h3>No projects found in this browser storage</h3>
           <p>Open both index.html and admin.html from the same localhost address. Projects saved under a different origin (for example, file:// versus http://localhost) are not shared automatically.</p>
         </div>`;
       return;
     }
   
     container.innerHTML = projects.map((project) => {
       const image = project.image || (Array.isArray(project.images) ? project.images[0] : '') || '';
       const id = Number(project.id);
       return `
         <div class="project-card">
           <img src="${safeText(image)}" alt="${safeText(project.title)}" class="project-thumbnail"
                onerror="this.style.visibility='hidden'">
           <div class="project-info">
             <h3>${safeText(project.title || 'Untitled project')}</h3>
             <p><strong>Category:</strong> ${safeText(project.category || 'Uncategorized')}</p>
             <p>${safeText((project.overview || '').slice(0, 120))}${(project.overview || '').length > 120 ? '…' : ''}</p>
           </div>
           <div class="project-actions">
             <button type="button" class="btn-action btn-edit" data-action="edit" data-id="${id}">Edit</button>
             <button type="button" class="btn-action btn-delete" data-action="delete" data-id="${id}">Delete</button>
           </div>
         </div>`;
     }).join('');
   }
   
   $('projectsList')?.addEventListener('click', (e) => {
     const button = e.target.closest('button[data-action]');
     if (!button) return;
     const id = Number(button.dataset.id);
     if (button.dataset.action === 'edit') editProject(id);
     if (button.dataset.action === 'delete') deleteProject(id);
   });
   
   function editProject(projectId) {
     const project = projects.find((p) => Number(p.id) === Number(projectId));
     if (!project) {
       showToast('Project not found. Refreshing the list.', 'error');
       loadProjects();
       displayProjects();
       return;
     }
   
     editingProjectId = Number(projectId);
     $('projectTitle').value = project.title || '';
     $('projectCategory').value = project.category || '';
     $('projectOverview').value = project.overview || '';
     $('projectChallenge').value = project.challenge || '';
     $('projectSolution').value = project.solution || '';
     $('projectTools').value = Array.isArray(project.tools) ? project.tools.join(', ') : '';
     $('projectLink').value = project.link || '';
     $('projectThumbnail').required = false;
     $('projectImages').required = false;
     $('formTitle').textContent = 'Edit Project';
     $('submitBtn').textContent = 'Update Project';
   
     const preview = $('thumbnailPreview');
     const previewImg = preview?.querySelector('img');
     if (preview && previewImg && project.image) {
       previewImg.src = project.image;
       preview.style.display = 'block';
     }
     const imagePreview = $('imagesPreview');
     if (imagePreview) {
       imagePreview.innerHTML = (project.images || []).map((src) =>
         `<img src="${safeText(src)}" alt="Existing project image" onerror="this.style.display='none'">`
       ).join('');
     }
     
     // Store the existing video reference so it's not lost during edit
     $('existingVideoReference')?.remove();
     if (project.video) {
       const hiddenField = document.createElement('input');
       hiddenField.type = 'hidden';
       hiddenField.id = 'existingVideoReference';
       hiddenField.value = project.video;
       $('projectForm').appendChild(hiddenField);
     }
     
     // Show video preview if it exists
     const videoPreview = $('videoPreview');
     if (videoPreview) {
       const video = videoPreview.querySelector('video');
       if (video && project.video) {
         video.src = project.video;
         videoPreview.style.display = 'block';
       }
     }
     
     showSection('add');
     document.querySelectorAll('.admin-nav-item').forEach((el) => el.classList.remove('active'));
     document.querySelectorAll('.admin-nav-item')[2]?.classList.add('active');
   }
   
   function deleteProject(projectId) {
     const project = projects.find((p) => Number(p.id) === Number(projectId));
     if (!project) return;
     if (!confirm(`Delete "${project.title || 'this project'}"? This cannot be undone.`)) return;
   
     projects = projects.filter((p) => Number(p.id) !== Number(projectId));
     if (saveProjectsToStorage()) {
       displayProjects();
       showToast('Project deleted.');
     }
   }
   
   function readFileAsDataURL(file, isVideo = false) {
     return new Promise((resolve, reject) => {
       // For video files, just return the filename - they'll be uploaded via FormData
       if (isVideo || file.type.startsWith('video/')) {
         resolve(file); // Return the File object itself
         return;
       }
       
       // For image files, apply compression
       const reader = new FileReader();
       reader.onload = () => {
         const img = new Image();
         img.onload = () => {
           const canvas = document.createElement('canvas');
           let width = img.width;
           let height = img.height;
           
           // Resize if image is too large
           const maxWidth = 1200;
           const maxHeight = 1200;
           if (width > maxWidth || height > maxHeight) {
             const scale = Math.min(maxWidth / width, maxHeight / height);
             width *= scale;
             height *= scale;
           }
           
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx.drawImage(img, 0, 0, width, height);
           
           // Compress to JPEG with 0.7 quality
           resolve(canvas.toDataURL('image/jpeg', 0.7));
         };
         img.onerror = () => reject(new Error(`Could not process ${file.name}`));
         img.src = reader.result;
       };
       reader.onerror = () => reject(new Error(`Could not read ${file.name}`));
       reader.readAsDataURL(file);
     });
   }
   
   $('projectThumbnail')?.addEventListener('change', async (e) => {
     const file = e.target.files?.[0];
     if (!file) return;
     try {
       const src = await readFileAsDataURL(file);
       const preview = $('thumbnailPreview');
       preview.querySelector('img').src = src;
       preview.style.display = 'block';
     } catch (error) { showToast(error.message, 'error'); }
   });
   
   $('projectImages')?.addEventListener('change', async (e) => {
     const preview = $('imagesPreview');
     preview.innerHTML = '';
     for (const file of Array.from(e.target.files || [])) {
       try {
         const src = await readFileAsDataURL(file);
         const img = document.createElement('img');
         img.src = src;
         img.alt = 'Selected project image';
         preview.appendChild(img);
       } catch (error) { showToast(error.message, 'error'); }
     }
   });

   $('projectVideo')?.addEventListener('change', async (e) => {
     const file = e.target.files?.[0];
     if (!file) return;
     try {
       // Show video preview
       const preview = $('videoPreview');
       const video = preview?.querySelector('video');
       if (video) {
         const url = URL.createObjectURL(file);
         video.src = url;
         preview.style.display = 'block';
       }
       showToast(`Video selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
     } catch (error) { showToast(error.message, 'error'); }
   });
   
   $('projectForm')?.addEventListener('submit', async (e) => {
     e.preventDefault();
   
     const title = $('projectTitle').value.trim();
     const category = $('projectCategory').value.trim();
     const overview = $('projectOverview').value.trim();
     const challenge = $('projectChallenge').value.trim();
     const solution = $('projectSolution').value.trim();
     const tools = $('projectTools').value.split(',').map((x) => x.trim()).filter(Boolean);
     const link = $('projectLink').value.trim();
     const thumbnailFile = $('projectThumbnail').files?.[0];
     const imageFiles = Array.from($('projectImages').files || []);
     const videoFile = $('projectVideo').files?.[0];
   
     if (!editingProjectId && (!thumbnailFile || imageFiles.length === 0)) {
       showToast('Please choose a thumbnail and at least one project image.', 'error');
       return;
     }
   
     const submit = $('submitBtn');
     submit.disabled = true;
     const oldText = submit.textContent;
     submit.textContent = 'Saving…';
   
     const wasEditing = Boolean(editingProjectId);
     try {
       const formData = new FormData();
       
       // Add text fields
       formData.append('title', title);
       formData.append('category', category);
       formData.append('overview', overview);
       formData.append('challenge', challenge);
       formData.append('solution', solution);
       formData.append('tools', JSON.stringify(tools));
       formData.append('link', link);
       
       // Add files
       if (thumbnailFile) {
         formData.append('thumbnail', thumbnailFile);
       }
       
       imageFiles.forEach(file => {
         formData.append('images', file);
       });
       
       if (videoFile) {
         formData.append('video', videoFile);
       }
       
       // Upload to server
       const method = wasEditing ? 'PUT' : 'POST';
       const url = wasEditing 
         ? `/api/admin/projects/${editingProjectId}`
         : '/api/admin/projects';
       
       const token = localStorage.getItem('adminToken') || '';
       const response = await fetch(url, {
         method,
         headers: {
           'Authorization': `Bearer ${token}`
         },
         body: formData
       });
       
       if (!response.ok) {
         const error = await response.json();
         throw new Error(error.error || error.message || 'Upload failed');
       }
       
       const result = await response.json();
       
       // Update local projects list
       if (wasEditing) {
         const idx = projects.findIndex(p => p.id === editingProjectId);
         if (idx >= 0) {
           projects[idx] = result.project;
         }
       } else {
         projects.push(result.project);
       }
       
       // Save to localStorage
       localStorage.setItem('portfolioProjects', JSON.stringify(projects));
       
       resetForm();
       displayProjects();
       showSection('projects');
       showToast(wasEditing ? 'Project updated.' : 'Project added.');
     } catch (error) {
       console.error(error);
       showToast(error.message || 'Could not save project.', 'error');
     } finally {
       submit.disabled = false;
       submit.textContent = wasEditing ? 'Update Project' : (oldText || 'Save Project');
     }
   });
   
   
   function resetForm() {
     const form = $('projectForm');
     if (form) form.reset();
     editingProjectId = null;
     if ($('formTitle')) $('formTitle').textContent = '➕ Add New Project';
     if ($('submitBtn')) $('submitBtn').textContent = 'Save Project';
     if ($('projectThumbnail')) $('projectThumbnail').required = true;
     if ($('projectImages')) $('projectImages').required = true;
     if ($('thumbnailPreview')) $('thumbnailPreview').style.display = 'none';
     if ($('imagesPreview')) $('imagesPreview').innerHTML = '';
     if ($('videoPreview')) $('videoPreview').style.display = 'none';
     // Clear the hidden video reference
     $('existingVideoReference')?.remove();
   }
   
   document.addEventListener('DOMContentLoaded', () => {
     loadProjects();
     loadProfile();
     loadContactSettings();
   });
   
   // ============================================
   // MESSAGES FUNCTIONALITY
   // ============================================
   
   let allMessages = [];
   
   async function loadMessages() {
     try {
       const token = localStorage.getItem('adminToken') || '';
       const response = await fetch('/api/admin/messages', {
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       
       if (!response.ok) return;
       
       const result = await response.json();
       allMessages = result.messages || [];
       displayMessages();
     } catch (error) {
       console.error('Error loading messages:', error);
     }
   }
   
   function displayMessages() {
     const container = $('messagesList');
     if (!container) return;
     
     if (!allMessages.length) {
       container.innerHTML = `
         <div class="empty-state">
           <h3>📭 No messages yet</h3>
           <p>Client messages from your portfolio contact form will appear here</p>
         </div>`;
       return;
     }
     
     container.innerHTML = allMessages.map((msg, index) => `
       <div class="message-card">
         <div class="message-header">
           <div>
             <h3>${safeText(msg.name)}</h3>
             <p class="message-email">📧 ${safeText(msg.email)}</p>
             <p class="message-date">📅 ${safeText(msg.date)}</p>
           </div>
           <button class="btn-delete-message" data-id="${index}">Delete</button>
         </div>
         <div class="message-content">
           <p>${safeText(msg.message).replace(/\n/g, '<br>')}</p>
         </div>
         <div class="message-actions">
           <a href="mailto:${safeText(msg.email)}" class="btn-reply">Reply via Email</a>
           <button class="btn-copy-email" onclick="copyToClipboard('${safeText(msg.email)}')">Copy Email</button>
         </div>
       </div>
     `).join('');
     
     // Add event listeners
     document.querySelectorAll('.btn-delete-message').forEach(btn => {
       btn.addEventListener('click', async (e) => {
         const id = btn.dataset.id;
         if (confirm('Delete this message?')) {
           await deleteMessage(id);
         }
       });
     });
   }
   
   async function deleteMessage(messageId) {
     try {
       const token = localStorage.getItem('adminToken') || '';
       const response = await fetch(`/api/admin/messages/${messageId}`, {
         method: 'DELETE',
         headers: {
           'Authorization': `Bearer ${token}`
         }
       });
       
       if (response.ok) {
         showToast('Message deleted.');
         await loadMessages();
       } else {
         showToast('Could not delete message.', 'error');
       }
     } catch (error) {
       console.error('Error:', error);
       showToast('Error deleting message.', 'error');
     }
   }
   
   function copyToClipboard(text) {
     navigator.clipboard.writeText(text).then(() => {
       showToast('Email copied to clipboard!');
     });
   }
   

   // ============================================
   // SECURITY SETTINGS
   // ============================================
   
   $('changeUsernameForm')?.addEventListener('submit', async (e) => {
     e.preventDefault();
     const currentPassword = $('currentPassword1').value;
     const newUsername = $('newUsername').value.trim();
     
     if (newUsername.length < 3) {
       showToast('Username must be at least 3 characters long.', 'error');
       return;
     }
     
     const button = e.target.querySelector('button[type="submit"]');
     button.disabled = true;
     const oldText = button.textContent;
     button.textContent = 'Updating…';
     
     try {
       const token = localStorage.getItem('adminToken') || '';
       const response = await fetch('/api/admin/security/change-username', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           currentPassword,
           newUsername
         })
       });
       
       if (!response.ok) {
         const error = await response.json();
         showToast(error.message || 'Failed to update username.', 'error');
         return;
       }
       
       const data = await response.json();
       showToast('Username updated successfully! Please login again with your new username.');
       // Log out and redirect to login
       setTimeout(() => {
         logout();
       }, 2000);
       
     } catch (error) {
       console.error('Error:', error);
       showToast('Error updating username. Please try again.', 'error');
     } finally {
       button.disabled = false;
       button.textContent = oldText;
       $('changeUsernameForm').reset();
     }
   });
   
   $('changePasswordForm')?.addEventListener('submit', async (e) => {
     e.preventDefault();
     const currentPassword = $('currentPassword2').value;
     const newPassword = $('newPassword').value;
     const confirmPassword = $('confirmPassword').value;
     
     if (newPassword.length < 6) {
       showToast('Password must be at least 6 characters long.', 'error');
       return;
     }
     
     if (newPassword !== confirmPassword) {
       showToast('Passwords do not match.', 'error');
       return;
     }
     
     const button = e.target.querySelector('button[type="submit"]');
     button.disabled = true;
     const oldText = button.textContent;
     button.textContent = 'Updating…';
     
     try {
       const token = localStorage.getItem('adminToken') || '';
       const response = await fetch('/api/admin/security/change-password', {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'Authorization': `Bearer ${token}`
         },
         body: JSON.stringify({
           currentPassword,
           newPassword
         })
       });
       
       if (!response.ok) {
         const error = await response.json();
         showToast(error.message || 'Failed to update password.', 'error');
         return;
       }
       
       showToast('Password updated successfully! Please login again with your new password.');
       // Log out and redirect to login
       setTimeout(() => {
         logout();
       }, 2000);
       
     } catch (error) {
       console.error('Error:', error);
       showToast('Error updating password. Please try again.', 'error');
     } finally {
       button.disabled = false;
       button.textContent = oldText;
       $('changePasswordForm').reset();
     }
   });
