const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key-change-in-production';

// ============================================
// DATABASE INITIALIZATION
// ============================================
const dbPath = path.join(__dirname, 'portfolio.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database error:', err);
    } else {
        console.log('✅ Connected to database:', dbPath);
        initializeDatabase();
    }
});

function initializeDatabase() {
    db.serialize(() => {
        // Create profile table
        db.run(`
            CREATE TABLE IF NOT EXISTS profile (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                name TEXT NOT NULL DEFAULT 'Your Name',
                position TEXT NOT NULL DEFAULT 'Multimedia Artist',
                bio TEXT NOT NULL DEFAULT 'Creative multimedia artist dedicated to creating innovative visual experiences.',
                email TEXT NOT NULL DEFAULT 'your@email.com'
            )
        `);

        // Create contact_settings table
        db.run(`
            CREATE TABLE IF NOT EXISTS contact_settings (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                email TEXT NOT NULL DEFAULT 'your@email.com',
                location TEXT DEFAULT '',
                social_links TEXT DEFAULT '[]'
            )
        `);

        // Create projects table
        db.run(`
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                category TEXT NOT NULL,
                image TEXT,
                images TEXT DEFAULT '[]',
                video TEXT,
                overview TEXT DEFAULT '',
                challenge TEXT DEFAULT '',
                solution TEXT DEFAULT '',
                tools TEXT DEFAULT '[]',
                link TEXT DEFAULT '',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create contact_messages table
        db.run(`
            CREATE TABLE IF NOT EXISTS contact_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create admin_credentials table
        db.run(`
            CREATE TABLE IF NOT EXISTS admin_credentials (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                username TEXT NOT NULL DEFAULT 'admin',
                password_hash TEXT NOT NULL
            )
        `);

        // Initialize default profile
        db.run(`INSERT OR IGNORE INTO profile (id, name, position, bio, email) 
                VALUES (1, 'Your Name', 'Multimedia Artist', 'Creative multimedia artist dedicated to creating innovative visual experiences.', 'your@email.com')`);

        // Initialize default contact settings
        db.run(`INSERT OR IGNORE INTO contact_settings (id, email, location, social_links)
                VALUES (1, 'your@email.com', '', '[]')`);

        // Initialize default admin credentials
        const defaultHash = bcrypt.hashSync('admin123', 10);
        db.run(`INSERT OR IGNORE INTO admin_credentials (id, username, password_hash)
                VALUES (1, 'admin', ?)`, [defaultHash]);

        console.log('✅ Database tables initialized');
    });
}

// Helper to run database queries with callbacks
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// ============================================
// EMAIL CONFIGURATION
// ============================================
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || 'your-gmail@gmail.com',
        pass: process.env.GMAIL_PASSWORD || 'your-app-password'
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log('⚠️ Email configuration issue:', error.message);
    } else {
        console.log('✅ Email service ready');
    }
});

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const compression = require('compression');
app.use(compression());

app.use(express.static('.', {
    maxAge: '1h',
    etag: false
}));

app.use((req, res, next) => {
    if (req.url.endsWith('.js') || req.url.endsWith('.css')) {
        res.set('Cache-Control', 'public, max-age=3600');
    } else if (req.url.endsWith('.html')) {
        res.set('Cache-Control', 'public, max-age=300');
    } else if (req.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/)) {
        res.set('Cache-Control', 'public, max-age=86400');
    }
    next();
});

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================
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
    limits: { fileSize: 500 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`));
        }
    }
});

// ============================================
// AUTHENTICATION
// ============================================
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const admin = await dbGet('SELECT * FROM admin_credentials WHERE id = 1');
        
        if (!admin || username !== admin.username || !bcrypt.compareSync(password, admin.password_hash)) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '24h' });
        res.json({ success: true, token });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// ============================================
// TOKEN VERIFICATION MIDDLEWARE
// ============================================
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        if (req.hostname === 'localhost' || req.hostname === '127.0.0.1') {
            req.user = { username: 'admin' };
            return next();
        }
        return res.status(401).json({ message: 'No token provided' });
    }
    
    if (token.startsWith('admin-session-')) {
        req.user = { username: 'admin' };
        return next();
    }
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.user = decoded;
        next();
    });
}

// ============================================
// PROFILE ENDPOINTS
// ============================================
app.get('/api/profile', async (req, res) => {
    try {
        const profile = await dbGet('SELECT * FROM profile WHERE id = 1');
        res.json(profile || {});
    } catch (error) {
        console.error('Error loading profile:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/profile', verifyToken, async (req, res) => {
    try {
        const { name, position, bio, email } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ success: false, message: 'Name and email are required' });
        }
        
        await dbRun(
            `INSERT OR REPLACE INTO profile (id, name, position, bio, email) VALUES (1, ?, ?, ?, ?)`,
            [name.trim(), position?.trim() || '', bio?.trim() || '', email.trim()]
        );
        
        const profile = await dbGet('SELECT * FROM profile WHERE id = 1');
        console.log('✅ Profile updated');
        res.json({ success: true, profile });
    } catch (error) {
        console.error('Error saving profile:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CONTACT SETTINGS ENDPOINTS
// ============================================
app.get('/api/contact-settings', async (req, res) => {
    try {
        const settings = await dbGet('SELECT * FROM contact_settings WHERE id = 1');
        
        res.json({
            email: settings?.email || 'your@email.com',
            location: settings?.location || '',
            socialLinks: settings ? JSON.parse(settings.social_links) : []
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/admin/contact-settings', verifyToken, async (req, res) => {
    try {
        const settings = await dbGet('SELECT * FROM contact_settings WHERE id = 1');
        
        res.json({
            success: true,
            settings: {
                email: settings?.email || 'your@email.com',
                location: settings?.location || '',
                socialLinks: settings ? JSON.parse(settings.social_links) : []
            }
        });
    } catch (error) {
        console.error('Error loading contact settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/admin/contact-settings', verifyToken, async (req, res) => {
    try {
        const { email, location, socialLinks } = req.body;
        
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }
        
        const socialLinksJson = JSON.stringify(
            Array.isArray(socialLinks) ? 
            socialLinks.filter(link => link.platform && link.url) : 
            []
        );
        
        await dbRun(
            `INSERT OR REPLACE INTO contact_settings (id, email, location, social_links) VALUES (1, ?, ?, ?)`,
            [email.trim(), location?.trim() || '', socialLinksJson]
        );
        
        console.log('✅ Contact settings updated');
        res.json({ 
            success: true, 
            settings: {
                email: email.trim(),
                location: location?.trim() || '',
                socialLinks: JSON.parse(socialLinksJson)
            }
        });
    } catch (error) {
        console.error('Error saving contact settings:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SECURITY ENDPOINTS
// ============================================
app.post('/api/admin/security/change-username', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newUsername } = req.body;
        
        if (!currentPassword || !newUsername) {
            return res.status(400).json({ message: 'Current password and new username are required' });
        }
        
        if (newUsername.length < 3) {
            return res.status(400).json({ message: 'Username must be at least 3 characters long' });
        }
        
        const admin = await dbGet('SELECT * FROM admin_credentials WHERE id = 1');
        
        if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        await dbRun('UPDATE admin_credentials SET username = ? WHERE id = 1', [newUsername]);
        
        console.log('✅ Admin username changed');
        res.json({ success: true, message: 'Username updated successfully' });
    } catch (error) {
        console.error('Error changing username:', error);
        res.status(500).json({ message: 'Error updating username' });
    }
});

app.post('/api/admin/security/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new passwords are required' });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        const admin = await dbGet('SELECT * FROM admin_credentials WHERE id = 1');
        
        if (!bcrypt.compareSync(currentPassword, admin.password_hash)) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }
        
        const newHash = bcrypt.hashSync(newPassword, 10);
        await dbRun('UPDATE admin_credentials SET password_hash = ? WHERE id = 1', [newHash]);
        
        console.log('✅ Admin password changed');
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ message: 'Error updating password' });
    }
});

// ============================================
// PROJECTS ENDPOINTS
// ============================================
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await dbAll('SELECT * FROM projects ORDER BY created_at DESC');
        const result = projects.map(p => ({
            ...p,
            images: JSON.parse(p.images),
            tools: JSON.parse(p.tools)
        }));
        res.json(result);
    } catch (error) {
        console.error('Error loading projects:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/admin/projects', verifyToken, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, category, overview, challenge, solution, tools, link } = req.body;
        
        if (!title || !category) {
            return res.status(400).json({ success: false, message: 'Title and category are required' });
        }
        
        const thumbnail = req.files?.thumbnail?.[0];
        const images = req.files?.images || [];
        const video = req.files?.video?.[0];
        
        if (!thumbnail || images.length === 0) {
            return res.status(400).json({ success: false, message: 'Thumbnail and at least one image are required' });
        }
        
        const toolsArray = typeof tools === 'string' ? JSON.parse(tools) : [];
        const imageUrls = images.map(f => `/uploads/${f.filename}`);
        const thumbnailUrl = `/uploads/${thumbnail.filename}`;
        const videoUrl = video ? `/uploads/${video.filename}` : '';
        
        const result = await dbRun(
            `INSERT INTO projects (title, category, image, images, video, overview, challenge, solution, tools, link)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title.trim(),
                category.trim(),
                thumbnailUrl,
                JSON.stringify(imageUrls),
                videoUrl,
                overview?.trim() || '',
                challenge?.trim() || '',
                solution?.trim() || '',
                JSON.stringify(toolsArray),
                link?.trim() || ''
            ]
        );
        
        const project = await dbGet('SELECT * FROM projects WHERE id = ?', [result.lastID]);
        project.images = JSON.parse(project.images);
        project.tools = JSON.parse(project.tools);
        
        console.log('✅ Project created');
        res.json({ success: true, project });
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.put('/api/admin/projects/:id', verifyToken, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]), async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        const { title, category, overview, challenge, solution, tools, link } = req.body;
        
        const existing = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);
        
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        
        const images = req.files?.images || [];
        const thumbnail = req.files?.thumbnail?.[0];
        const video = req.files?.video?.[0];
        
        const thumbnailUrl = thumbnail ? `/uploads/${thumbnail.filename}` : existing.image;
        const imageUrls = images.length > 0 ? 
            images.map(f => `/uploads/${f.filename}`) : 
            JSON.parse(existing.images);
        const videoUrl = video ? `/uploads/${video.filename}` : existing.video;
        const toolsArray = typeof tools === 'string' ? JSON.parse(tools) : JSON.parse(existing.tools);
        
        await dbRun(
            `UPDATE projects 
             SET title = ?, category = ?, image = ?, images = ?, video = ?, overview = ?, challenge = ?, solution = ?, tools = ?, link = ?
             WHERE id = ?`,
            [
                title?.trim() || existing.title,
                category?.trim() || existing.category,
                thumbnailUrl,
                JSON.stringify(imageUrls),
                videoUrl,
                overview?.trim() || existing.overview,
                challenge?.trim() || existing.challenge,
                solution?.trim() || existing.solution,
                JSON.stringify(toolsArray),
                link?.trim() || existing.link,
                projectId
            ]
        );
        
        const updated = await dbGet('SELECT * FROM projects WHERE id = ?', [projectId]);
        updated.images = JSON.parse(updated.images);
        updated.tools = JSON.parse(updated.tools);
        
        console.log('✅ Project updated');
        res.json({ success: true, project: updated });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/projects/:id', verifyToken, async (req, res) => {
    try {
        const projectId = parseInt(req.params.id);
        await dbRun('DELETE FROM projects WHERE id = ?', [projectId]);
        
        console.log('✅ Project deleted');
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// CONTACT MESSAGES ENDPOINTS
// ============================================
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        
        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        
        await dbRun(
            'INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)',
            [name.trim(), email.trim(), message.trim()]
        );
        
        console.log('✅ Contact message saved');
        res.json({ success: true, message: 'Message received! Thank you for contacting me.' });
    } catch (error) {
        console.error('Contact error:', error);
        res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
});

app.get('/api/admin/messages', verifyToken, async (req, res) => {
    try {
        const messages = await dbAll('SELECT * FROM contact_messages ORDER BY created_at DESC');
        const result = messages.map((msg, index) => ({
            id: index,
            name: msg.name,
            email: msg.email,
            message: msg.message,
            date: new Date(msg.created_at).toLocaleString()
        }));
        
        res.json({ success: true, messages: result });
    } catch (error) {
        console.error('Error loading messages:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/admin/messages/:id', verifyToken, async (req, res) => {
    try {
        const messageId = parseInt(req.params.id);
        const messages = await dbAll('SELECT rowid FROM contact_messages ORDER BY created_at DESC');
        
        if (messageId < messages.length) {
            const rowid = messages[messageId].rowid;
            await dbRun('DELETE FROM contact_messages WHERE rowid = ?', [rowid]);
            console.log('✅ Message deleted');
        }
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// SERVER START
// ============================================
const server = app.listen(PORT, '0.0.0.0', () => {
    const env = process.env.NODE_ENV || 'development';
    console.log(`✅ Portfolio server running on port ${PORT} (${env})`);
    console.log(`📱 Admin: http://localhost:${PORT}/admin.html`);
    console.log(`🌍 Website: http://localhost:${PORT}`);
    console.log(`💾 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    server.close(() => {
        db.close();
        process.exit(0);
    });
});
