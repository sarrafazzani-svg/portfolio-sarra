// ============================================
// PROJECT DATA WITH REAL IMAGES
// ============================================

let projects = [];

// ============================================
// ARC GALLERY INITIALIZATION WITH AUTO-ROTATION
// ============================================

let currentRotation = 0;
let animationFrameId = null;
let isAutoRotating = true;
let isHoveringProject = false;

function initArcGallery() {
    const gallery = document.getElementById('arcGallery');
    const itemCount = projects.length;
    
    // Calculate responsive radius based on gallery dimensions
    // Use requestAnimationFrame to ensure gallery is rendered first
    const calculateAndRender = () => {
        const galleryWidth = gallery.offsetWidth || 1200;
        const galleryHeight = gallery.offsetHeight || 600;
        
        // Responsive arc radius calculation
        // Desktop (2:1): 1200×600 → radius ~270px
        // Tablet (95vw×75vw at 768px): ~730×547 → radius ~165px
        // Mobile (90vw×90vw max 420px): 420×420 → radius ~100px
        // This creates appropriate spacing on each device
        let arcRadius;
        if (window.innerWidth > 1024) {
            // Preserve the existing laptop calculation
            arcRadius = Math.min(
                galleryWidth * 0.38,
                galleryHeight * 0.60
            );
        } else if (window.innerWidth > 768) {
            // Tablet: spread smaller cards around the circle
            arcRadius = Math.min(
                galleryWidth * 0.40,
                galleryHeight * 0.43
            );
        } else {
            // Phone: smaller cards and a more open loop
            arcRadius = Math.min(
                galleryWidth * 0.40,
                galleryHeight * 0.40
            );
        }
        
        const startAngle = -90;
        const arcSpan = 180;
        const angleSlice = arcSpan / itemCount;
        
        gallery.innerHTML = '';
        
        // Create duplicate items for seamless looping
        const allProjects = [...projects, ...projects];
        
        allProjects.forEach((project, index) => {
            const angle = startAngle + (angleSlice * index);
            const radian = (angle * Math.PI) / 180;
            
            // Calculate position on arc
            const x = arcRadius * Math.cos(radian);
            const y = arcRadius * Math.sin(radian);
            
            // Calculate rotation for visual tilt
            const rotationZ = angle + 90;
            
            const item = document.createElement('div');
            item.className = 'arc-item';
            item.dataset.projectId = project.id;
            item.dataset.angle = angle;
            item.dataset.index = index;
            
            // Position the item
            item.style.left = '50%';
            item.style.top = '50%';
            item.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotateZ(${rotationZ}deg)`;
            
            // Ensure image paths are valid and handle different formats
            let imageUrl = project.image;
            if (imageUrl) {
                // If it's a data URL, use as-is
                if (imageUrl.startsWith('data:')) {
                    // Use data URL directly
                } 
                // If it's an http/https URL, use as-is
                else if (imageUrl.startsWith('http')) {
                    // Use full URL as-is
                }
                // If it's an uploaded file path
                else if (imageUrl.startsWith('uploads/')) {
                    imageUrl = imageUrl; // Already has correct path
                }
                // Otherwise, assume it's a filename in root directory
                else {
                    imageUrl = './' + imageUrl;
                }
            }
            
            item.innerHTML = `
                <div class="arc-item-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat; width: 100%; height: 100%;"></div>
                <div class="arc-item-overlay">
                    <div class="arc-item-title">${project.title}</div>
                </div>
            `;
            
            item.addEventListener('mouseenter', () => {
                isHoveringProject = true;
            });
            
            item.addEventListener('mouseleave', () => {
                isHoveringProject = false;
            });
            
            item.addEventListener('click', (e) => {
                if (isHoveringProject) {
                    e.stopPropagation();
                    e.preventDefault();
                    openProjectDetail(project.id);
                }
            });
            
            gallery.appendChild(item);
        });
        
        // Start automatic rotation
        startAutoRotation();
    };
    
    // Ensure gallery is rendered before calculating
    if (gallery.offsetWidth > 0) {
        calculateAndRender();
    } else {
        requestAnimationFrame(calculateAndRender);
    }
}

// ============================================
// AUTO-ROTATION ANIMATION - CONTINUOUS MOVEMENT
// ============================================

function startAutoRotation() {
    // Prevent multiple animation loops from running together
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    
    isAutoRotating = true;
    
    function animate() {
        const gallery = document.querySelector(".arc-gallery");
        if (!gallery) {
            animationFrameId = null;
            return;
        }
        
        if (isAutoRotating && !isHoveringProject) {
            currentRotation = (currentRotation + 0.015) % 360;
            gallery.style.transform = `rotate(${currentRotation}deg)`;
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animationFrameId = requestAnimationFrame(animate);
}

function stopAutoRotation() {
    isAutoRotating = false;
}

// ============================================
// PROJECT DETAIL VIEW - SCROLLABLE SECTION
// ============================================

function openProjectDetail(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Populate detail section
    document.getElementById('detailSectionTitle').textContent = project.title;
    document.getElementById('detailSectionCategory').textContent = project.category;
    document.getElementById('detailSectionOverview').textContent = project.overview;
    document.getElementById('detailSectionChallenge').textContent = project.challenge;
    document.getElementById('detailSectionSolution').textContent = project.solution;
    
    // Set main image (always show first image, not video)
    const mainImage = document.getElementById('detailMainImage');
    let imageSrc = project.images[0];
    
    // Ensure proper image path formatting
    if (imageSrc && !imageSrc.startsWith('data:') && !imageSrc.startsWith('http')) {
        if (!imageSrc.startsWith('uploads/')) {
            imageSrc = './' + imageSrc;
        }
    }
    
    mainImage.src = imageSrc;
    mainImage.style.cursor = 'default';
    mainImage.onclick = null;
    
    // Hide the video player div if it exists
    const videoPlayer = document.getElementById('detailMainVideo');
    if (videoPlayer) {
        videoPlayer.style.display = 'none';
    }
    mainImage.style.display = 'block';
    
    // Generate thumbnail gallery with images only
    const thumbnailsContainer = document.getElementById('detailThumbnails');
    thumbnailsContainer.innerHTML = project.images.map((img, index) => {
        let thumbSrc = img;
        if (thumbSrc && !thumbSrc.startsWith('data:') && !thumbSrc.startsWith('http')) {
            if (!thumbSrc.startsWith('uploads/')) {
                thumbSrc = './' + thumbSrc;
            }
        }
        return `
        <img 
            class="detail-thumbnail ${index === 0 ? 'active' : ''}"
            src="${thumbSrc}" 
            alt="Project image ${index + 1}"
            onclick="changeDetailImage('${thumbSrc}', this)"
        >
    `}).join('');
    
    // Populate tools
    const toolsList = document.getElementById('detailSectionTools');
    toolsList.innerHTML = project.tools.map(tool => 
        `<span class="tool-tag">${tool}</span>`
    ).join('');
    
    // Show/hide buttons
    const moreBtn = document.getElementById('detailMoreBtn');
    const videoBtn = document.getElementById('detailVideoBtn');
    
    // Show "More" button if there's a project link
    if (project.link && project.link.trim()) {
        moreBtn.style.display = 'inline-block';
        moreBtn.dataset.projectId = projectId;
    } else {
        moreBtn.style.display = 'none';
    }
    
    // Show "Watch Video" button if there's a video
    if (project.video && project.video.trim()) {
        videoBtn.style.display = 'inline-block';
        videoBtn.dataset.projectId = projectId;
    } else {
        videoBtn.style.display = 'none';
    }
    
    // Show detail section and scroll to it
    const detailSection = document.getElementById('projectDetail');
    detailSection.classList.remove('hidden');
    
    setTimeout(() => {
        detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

function openDetailMedia() {
    const moreBtn = document.getElementById('detailMoreBtn');
    const projectId = moreBtn.dataset.projectId;
    const project = projects.find(p => p.id === parseInt(projectId));
    
    if (!project) return;
    
    // If project has a link, open it
    if (project.link && project.link.trim()) {
        window.open(project.link, '_blank');
    }
}

function openDetailVideo() {
    const videoBtn = document.getElementById('detailVideoBtn');
    const projectId = videoBtn.dataset.projectId;
    const project = projects.find(p => p.id === parseInt(projectId));
    
    if (!project || !project.video) return;
    
    // Open video in fullscreen modal
    openMediaModal('video', project.video);
}

function changeDetailImage(imageSrc, thumbnailElement) {
    const mainImage = document.getElementById('detailMainImage');
    mainImage.src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.detail-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    thumbnailElement.classList.add('active');
    
    // Make main image clickable to open modal
    mainImage.style.cursor = 'zoom-in';
    mainImage.onclick = () => openMediaModal('image', imageSrc);
}

// ============================================
// MEDIA MODAL - IMAGE ZOOM & VIDEO FULLSCREEN
// ============================================

let currentZoom = 1;
const maxZoom = 3;
const minZoom = 0.5;

function openMediaModal(type, src) {
    const modal = document.getElementById('mediaModal');
    const imageViewer = document.getElementById('imageViewer');
    const videoViewer = document.getElementById('videoViewer');
    
    modal.style.display = 'flex';
    
    if (type === 'image') {
        imageViewer.style.display = 'flex';
        videoViewer.style.display = 'none';
        document.getElementById('viewerImage').src = src;
        resetZoom();
    } else if (type === 'video') {
        videoViewer.style.display = 'flex';
        imageViewer.style.display = 'none';
        const video = document.getElementById('viewerVideo');
        
        // Ensure no filters or opacity issues
        video.style.opacity = '1';
        video.style.filter = 'none';
        video.style.background = '#000';
        
        // If src is just a filename (stored from admin), use it directly
        // If it's a data URL, use it as-is
        const videoSrc = src.startsWith('data:') ? src : src;
        video.src = videoSrc;
        video.play();
    }
}

function closeMediaModal() {
    const modal = document.getElementById('mediaModal');
    const video = document.getElementById('viewerVideo');
    video.pause();
    video.src = '';
    modal.style.display = 'none';
    resetZoom();
}

function zoomImage(delta) {
    const newZoom = Math.max(minZoom, Math.min(maxZoom, currentZoom + delta));
    currentZoom = newZoom;
    
    const img = document.getElementById('viewerImage');
    img.style.transform = `scale(${currentZoom})`;
    document.getElementById('zoomLevel').textContent = Math.round(currentZoom * 100) + '%';
}

function resetZoom() {
    currentZoom = 1;
    const img = document.getElementById('viewerImage');
    img.style.transform = 'scale(1)';
    document.getElementById('zoomLevel').textContent = '100%';
}

function closeProjectDetailSection() {
    const detailSection = document.getElementById('projectDetail');
    detailSection.classList.add('hidden');
    smoothScroll('home');
}

// ============================================
// GENERATE PROJECT GRID
// ============================================

function generateProjectsGrid() {
    const grid = document.getElementById('projectsGrid');
    if (!grid) return;
    
    grid.innerHTML = projects.map(project => {
        let imageUrl = project.image;
        
        // Ensure proper image path formatting
        if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
            if (!imageUrl.startsWith('uploads/')) {
                imageUrl = './' + imageUrl;
            }
        }
        
        return `
        <div class="project-card" onclick="openProjectDetail(${project.id})">
            <div class="project-image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center; background-repeat: no-repeat;">
                <div class="project-overlay">
                    <span class="project-tag">${project.category}</span>
                </div>
            </div>
            <div class="project-info">
                <h3>${project.title}</h3>
                <p>${project.overview}</p>
            </div>
        </div>
    `}).join('');
}

// ============================================
// SMOOTH SCROLL
// ============================================

function smoothScroll(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ============================================
// CONTACT FORM
// ============================================

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Get form data
        const name = contactForm.querySelector('input[placeholder="Your Name"]').value;
        const email = contactForm.querySelector('input[placeholder="Your Email"]').value;
        const message = contactForm.querySelector('textarea[placeholder="Tell me about your project"]').value;
        
        // Validate
        if (!name || !email || !message) {
            alert('Please fill in all fields');
            return;
        }
        
        // Disable button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            // Send to server
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, message })
            });
            
            const result = await response.json();
            
            if (response.ok && result.success) {
                // Success
                submitBtn.textContent = '✓ Message Sent!';
                submitBtn.style.background = '#4CAF50';
                contactForm.reset();
                
                // Reset after 3 seconds
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.disabled = false;
                }, 3000);
            } else {
                // Error
                alert(result.message || 'Failed to send message');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.background = '';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error sending message. Please check console for details.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.background = '';
        }
    });
}

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        if (link.getAttribute('href').slice(1) === current) {
            link.style.color = '#000000';
        } else {
            link.style.color = '';
        }
    });
}

window.addEventListener('scroll', updateActiveNavLink);

// ============================================
// LOAD PROFILE
// ============================================

async function loadProfile() {
    try {
        // Always load from server first - this is the source of truth
        const response = await fetch('/api/profile');
        if (response.ok) {
            const profile = await response.json();
            document.getElementById('heroName').textContent = profile.name || 'Find Poetry in Motion';
            document.getElementById('heroPosition').textContent = profile.position || 'Creative professional';
            
            const bioElement = document.querySelector('.about-text p:first-of-type');
            if (bioElement && profile.bio) {
                bioElement.textContent = profile.bio;
            }
            return;
        }
    } catch (e) {
        console.log('Could not load profile from server');
    }
}

// ============================================
// LOAD AND DISPLAY CONTACT INFORMATION
// ============================================

async function loadAndDisplayContactInfo() {
    try {
        // Try to load from API first (server-persisted settings)
        const response = await fetch('/api/contact-settings');
        let contactSettings;
        
        if (response.ok) {
            contactSettings = await response.json();
        } else {
            // Fallback to localStorage
            const stored = localStorage.getItem('portfolioContacts');
            if (!stored) return;
            contactSettings = JSON.parse(stored);
        }
        
        const contactInfo = document.querySelector('.contact-info');
        if (!contactInfo) return;
        
        // Update email
        const emailItems = contactInfo.querySelectorAll('.info-item');
        let emailItem = null;
        for (let item of emailItems) {
            if (item.querySelector('h3')?.textContent === 'Email') {
                emailItem = item;
                break;
            }
        }
        
        if (emailItem && contactSettings.email) {
            let emailLink = emailItem.querySelector('a[href^="mailto:"]');
            if (!emailLink) {
                emailLink = document.createElement('a');
                emailItem.appendChild(emailLink);
            }
            emailLink.href = `mailto:${contactSettings.email}`;
            emailLink.textContent = contactSettings.email;
            emailLink.className = '';
            emailItem.style.display = 'block';
        }
        
        // Update social links
        const socialItem = Array.from(emailItems).find(item => 
            item.querySelector('h3')?.textContent === 'Social'
        );
        
        if (socialItem && contactSettings.socialLinks && contactSettings.socialLinks.length > 0) {
            const socialLinksDiv = socialItem.querySelector('.social-links');
            if (socialLinksDiv) {
                socialLinksDiv.innerHTML = contactSettings.socialLinks.map(link => 
                    `<a href="${link.url}" target="_blank" class="social-link" rel="noopener noreferrer">${link.platform}</a>`
                ).join('');
                socialItem.style.display = 'block';
            }
        } else if (socialItem) {
            // Hide social section if no links
            socialItem.style.display = 'none';
        }
        
        // Update or hide location
        const locationItem = Array.from(emailItems).find(item => 
            item.querySelector('h3')?.textContent === 'Location'
        );
        
        if (locationItem) {
            if (contactSettings.location && contactSettings.location.trim()) {
                const locationP = locationItem.querySelector('p');
                if (locationP) {
                    locationP.textContent = contactSettings.location;
                    locationItem.style.display = 'block';
                }
            } else {
                // Hide if no location set
                locationItem.style.display = 'none';
            }
        }
    } catch (e) {
        console.log('Could not load contact settings from API, using localStorage:', e);
        // Fallback to localStorage method
        const stored = localStorage.getItem('portfolioContacts');
        if (!stored) return;
        
        try {
            const contactSettings = JSON.parse(stored);
            const contactInfo = document.querySelector('.contact-info');
            
            if (!contactInfo) return;
            
            // Update email
            const emailItem = contactInfo.querySelector('a[href^="mailto:"]');
            if (emailItem && contactSettings.email) {
                emailItem.href = `mailto:${contactSettings.email}`;
                emailItem.textContent = contactSettings.email;
            }
            
            // Update social links
            const socialLinksDiv = contactInfo.querySelector('.social-links');
            if (socialLinksDiv && contactSettings.socialLinks && contactSettings.socialLinks.length > 0) {
                socialLinksDiv.innerHTML = contactSettings.socialLinks.map(link => 
                    `<a href="${link.url}" target="_blank" class="social-link" rel="noopener noreferrer">${link.platform}</a>`
                ).join('');
            }
            
            // Update or hide location
            const locationItem = Array.from(contactInfo.querySelectorAll('.info-item')).find(item => 
                item.querySelector('h3')?.textContent === 'Location'
            );
            
            if (locationItem) {
                if (contactSettings.location && contactSettings.location.trim()) {
                    const locationP = locationItem.querySelector('p');
                    if (locationP) {
                        locationP.textContent = contactSettings.location;
                        locationItem.style.display = 'block';
                    }
                } else {
                    locationItem.style.display = 'none';
                }
            }
        } catch (e) {
            console.log('Could not parse localStorage contact settings');
        }
    }
}

// ============================================
// LOAD PROJECTS FROM SERVER (ALWAYS - SERVER IS SOURCE OF TRUTH)
// ============================================

async function loadProjectsFromServer() {
    try {
        const response = await fetch('/api/projects');
        if (response.ok) {
            projects = await response.json();
            console.log('Loaded ' + projects.length + ' projects from server');
            return true;
        }
    } catch (e) {
        console.log('Could not load projects from server');
    }
    return false;
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    loadProfile();
    loadAndDisplayContactInfo();
    
    // Load projects from server (this is now the PRIMARY source)
    await loadProjectsFromServer();
    
    initArcGallery();
    generateProjectsGrid();
    
    // ============================================
    // PAUSE ROTATION WHEN HOVERING OVER GALLERY
    // ============================================
    const gallery = document.querySelector(".arc-gallery");
    if (gallery) {
        gallery.onmouseenter = () => {
            isHoveringProject = true;
            stopAutoRotation();
        };
        gallery.onmouseleave = () => {
            isHoveringProject = false;
            startAutoRotation();
        };
    }
    
    // ============================================
    // MAKE EVERY PROJECT CARD CLICKABLE
    // ============================================
    document.querySelectorAll(".arc-item").forEach((item) => {
        item.onclick = (event) => {
            event.stopPropagation();
            const projectId = item.dataset.projectId;
            if (projectId !== undefined && projectId !== "") {
                openProjectDetail(projectId);
            }
        };
    });
    
    // ============================================
    // RE-INITIALIZE GALLERY ON WINDOW RESIZE
    // ============================================
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Only reinitialize if screen size changed significantly
            initArcGallery();
        }, 250);
    });
    
    console.log('Portfolio loaded successfully');
});
