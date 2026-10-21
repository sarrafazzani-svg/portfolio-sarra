const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

// ============================================
// EMAIL CONFIGURATION
// ============================================
// Configure Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'your-gmail@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'your-app-password'
    }
});

// Test email connection
transporter.verify((error, success) => {
    if (error) {
        console.log('⚠️ Email configuration issue:', error.message);
    } else {
        console.log('✅ Email service ready');
    }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('.'));

// Storage setup
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit for videos
    fileFilter: (req, file, cb) => {
        // Allow images and videos
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    }
});

// Admin credentials file
const credentialsFile = path.join(__dirname, '.admin-credentials.json');

// Contact settings file
const contactSettingsFile = path.join(__dirname, '.contact-settings.json');

function loadContactSettings() {
    try {
        if (fs.existsSync(contactSettingsFile)) {
            return JSON.parse(fs.readFileSync(contactSettingsFile, 'utf8'));
        }
    } catch (e) {
        console.log('Could not load contact settings');
    }
    
    // Default contact settings
    return {
        email: 'your@email.com',
        location: '',
        socialLinks: []
    };
}

function saveContactSettings(settings) {
    try {
        fs.writeFileSync(contactSettingsFile, JSON.stringify(settings, null, 2), { mode: 0o600 });
        console.log('✅ Contact settings saved');
    } catch (e) {
        console.error('Could not save contact settings:', e);
    }
}

function loadAdminCredentials() {
    try {
        if (fs.existsSync(credentialsFile)) {
            return JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
        }
    } catch (e) {
        console.log('Could not load admin credentials');
    }
    
    // Default credentials on first run - MUST BE CHANGED
    const defaultCredentials = {
        username: 'admin',
        passwordHash: bcrypt.hashSync('admin123', 10)
    };
    
    saveAdminCredentials(defaultCredentials);
    console.log('⚠️  Default admin credentials created. PLEASE CHANGE THE PASSWORD IMMEDIATELY!');
    return defaultCredentials;
}

function saveAdminCredentials(credentials) {
    try {
        // Ensure file has restrictive permissions
        fs.writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2), { mode: 0o600 });
    } catch (e) {
        console.error('Could not save admin credentials:', e);
    }
}

let adminCredentials = loadAdminCredentials();

// Projects data file
const projectsFile = path.join(__dirname, 'projects.json');

function loadProjects() {
    try {
        if (fs.existsSync(projectsFile)) {
            return JSON.parse(fs.readFileSync(projectsFile, 'utf8'));
        }
    } catch (e) {
        console.log('Could not load projects');
    }
    return [];
}

function saveProjects(projects) {
    try {
        fs.writeFileSync(projectsFile, JSON.stringify(projects, null, 2));
        console.log('Projects saved to projects.json');
    } catch (e) {
        console.error('Could not save projects to file:', e);
    }
}

// Auth Routes
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === adminCredentials.username && bcrypt.compareSync(password, adminCredentials.passwordHash)) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ success: true, token });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
});

// Middleware to verify token
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    // For now, accept both JWT tokens and simple session tokens
    if (!token) {
        // If no token, allow if it's from localhost (development)
        if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
            req.user = { username: 'admin' };
            return next();
        }
        return res.status(401).json({ message: 'No token provided' });
    }
    
    // Check if it's a simple session token (from our localStorage)
    if (token.startsWith('admin-session-')) {
        req.user = { username: 'admin' };
        return next();
    }
    
    // Otherwise try to verify as JWT
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

// ============================================
// CONTACT SETTINGS ENDPOINTS
// ============================================
app.get('/api/admin/contact-settings', verifyToken, (req, res) => {
    try {
        const settings = loadContactSettings();
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error loading contact settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/contact-settings', verifyToken, (req, res) => {
    try {
        const { email, location, socialLinks } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        const settings = {
            email: email.trim(),
            location: location?.trim() || '',
            socialLinks: Array.isArray(socialLinks) ? socialLinks.filter(link => 
                link.platform && link.platform.trim() && link.url && link.url.trim()
            ) : []
        };
        
        saveContactSettings(settings);
        res.json({ success: true, settings });
    } catch (error) {
        console.error('Error saving contact settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// GET CONTACT SETTINGS (PUBLIC)
// ============================================
app.get('/api/contact-settings', (req, res) => {
    try {
        const settings = loadContactSettings();
        res.json(settings);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================

app.post('/api/admin/security/change-username', verifyToken, (req, res) => {
    try {
        const { currentPassword, newUsername } = req.body;
        
        if (!currentPassword || !newUsername) {
            return res.status(400).json({ message: 'Current password and new username are required' });
        }
        
        if (newUsername.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }
        
        // Verify current password
        if (!bcrypt.compareSync(currentPassword, adminCredentials.passwordHash)) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update username
        adminCredentials.username = newUsername;
        saveAdminCredentials(adminCredentials);
        
        console.log('✅ Admin username changed');
        res.json({ success: true, message: 'Username updated successfully' });
    } catch (error) {
        console.error('Error changing username:', error);
        res.status(500).json({ message: 'Error updating username' });
    }
});

app.post('/api/admin/security/change-password', verifyToken, (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // Verify current password
        if (!bcrypt.compareSync(currentPassword, adminCredentials.passwordHash)) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        // Update password with bcrypt hashing
        adminCredentials.passwordHash = bcrypt.hashSync(newPassword, 10);
        saveAdminCredentials(adminCredentials);
        
        console.log('✅ Admin password changed');
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

// Project Routes
app.get('/api/projects', (req, res) => {
    res.json(loadProjects());
});

// Sync localStorage from client to server (save data persistently)
app.post('/api/projects/sync', (req, res) => {
    try {
        const projects = req.body;
        if (!Array.isArray(projects)) {
            return res.status(400).json({ success: false, message: 'Invalid projects data' });
        }
        saveProjects(projects);
        res.json({ success: true, message: 'Projects synced successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/projects', verifyToken, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    try {
        const projects = loadProjects();
        const newId = Math.max(...projects.map(p => p.id), 0) + 1;
        
        const project = {
            id: newId,
            title: req.body.title,
            category: req.body.category,
            image: req.files.thumbnail ? `/uploads/${req.files.thumbnail[0].filename}` : '',
            images: req.files.images ? req.files.images.map(f => `/uploads/${f.filename}`) : [],
            video: req.files.video ? `/uploads/${req.files.video[0].filename}` : '',
            overview: req.body.overview,
            challenge: req.body.challenge,
            solution: req.body.solution,
            tools: JSON.parse(req.body.tools || '[]'),
            link: req.body.link || ''
        };
        
        projects.push(project);
        saveProjects(projects);
        res.json({ success: true, project });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.put('/api/admin/projects/:id', verifyToken, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]), (req, res) => {
    try {
        const projects = loadProjects();
        const project = projects.find(p => p.id === parseInt(req.params.id));
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        project.title = req.body.title;
        project.category = req.body.category;
        project.overview = req.body.overview;
        project.challenge = req.body.challenge;
        project.solution = req.body.solution;
        project.tools = JSON.parse(req.body.tools || '[]');
        project.link = req.body.link || '';
        
        if (req.files.thumbnail) {
            project.image = `/uploads/${req.files.thumbnail[0].filename}`;
        }
        
        if (req.files.images) {
            project.images = req.files.images.map(f => `/uploads/${f.filename}`);
        }
        
        if (req.files.video) {
            project.video = `/uploads/${req.files.video[0].filename}`;
        }
        
        saveProjects(projects);
        res.json({ success: true, project });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.delete('/api/admin/projects/:id', verifyToken, (req, res) => {
    try {
        const projects = loadProjects();
        const filtered = projects.filter(p => p.id !== parseInt(req.params.id));
        saveProjects(filtered);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ============================================
// CONTACT MESSAGES - GET ALL MESSAGES (ADMIN)
// ============================================
app.get('/api/admin/messages', verifyToken, (req, res) => {
    try {
        const contactsFile = path.join(__dirname, 'contacts.txt');
        
        if (!fs.existsSync(contactsFile)) {
            return res.json({ success: true, messages: [] });
        }
        
        const content = fs.readFileSync(contactsFile, 'utf8');
        
        // Parse messages from the text file
        const messages = [];
        const blocks = content.split('================================================================================');
        
        blocks.forEach((block, index) => {
            if (!block.trim()) return;
            
            const lines = block.trim().split('\n').filter(l => l.trim());
            let message = {};
            
            lines.forEach(line => {
                if (line.startsWith('DATE:')) {
                    message.date = line.replace('DATE:', '').trim();
                } else if (line.startsWith('NAME:')) {
                    message.name = line.replace('NAME:', '').trim();
                } else if (line.startsWith('EMAIL:')) {
                    message.email = line.replace('EMAIL:', '').trim();
                } else if (line.startsWith('MESSAGE:')) {
                    // MESSAGE: is the header, content comes after
                    const messageStart = block.indexOf('MESSAGE:') + 'MESSAGE:'.length;
                    message.message = block.substring(messageStart).trim();
                }
            });
            
            if (message.name && message.email) {
                message.id = index;
                messages.push(message);
            }
        });
        
        res.json({ success: true, messages: messages.reverse() }); // Show newest first
    } catch (error) {
        console.error('Error reading messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CONTACT MESSAGES - DELETE MESSAGE (ADMIN)
// ============================================
app.delete('/api/admin/messages/:id', verifyToken, (req, res) => {
    try {
        const contactsFile = path.join(__dirname, 'contacts.txt');
        
        if (!fs.existsSync(contactsFile)) {
            return res.json({ success: true });
        }
        
        const content = fs.readFileSync(contactsFile, 'utf8');
        const messages = [];
        const blocks = content.split('================================================================================');
        
        let messageIndex = 0;
        const filteredBlocks = blocks.filter((block, index) => {
            if (!block.trim()) return true; // Keep empty blocks
            
            const lines = block.trim().split('\n').filter(l => l.trim());
            let hasData = lines.some(l => l.startsWith('NAME:') || l.startsWith('EMAIL:'));
            
            if (hasData) {
                if (messageIndex === parseInt(req.params.id)) {
                    messageIndex++;
                    return false; // Remove this block
                }
                messageIndex++;
            }
            return true;
        });
        
        fs.writeFileSync(contactsFile, filteredBlocks.join('================================================================================'));
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CONTACT FORM - SAVE TO FILE (SIMPLE & RELIABLE)
// ============================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        // Create contact message with timestamp
        const timestamp = new Date().toLocaleString();
        const contactMessage = `
================================================================================
DATE: ${timestamp}
NAME: ${name}
EMAIL: ${email}
MESSAGE:
${message}
================================================================================

`;
        
        // Save to contacts.txt file
        const contactsFile = path.join(__dirname, 'contacts.txt');
        fs.appendFileSync(contactsFile, contactMessage);
        
        console.log('✅ Contact message saved from:', name);
        res.json({ 
            success: true, 
            message: 'Message received! Thank you for contacting me.' 
        });
        
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'An error occurred. Please try again.' 
        });
    }
});

const server = app.listen(PORT, '0.0.0.0', () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`✅ Portfolio server running on port ${PORT} (${env})`);
    console.log(`📱 Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🌍 Website: http://localhost:${PORT}`);
});
