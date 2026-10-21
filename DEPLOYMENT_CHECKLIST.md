# 🚀 Portfolio Deployment Guide - Complete Checklist

Your portfolio is ready to go live! Follow these steps to deploy and share it with the world.

---

## ✅ Pre-Deployment Checklist (Do This First)

### 1. **Update Admin Credentials** ⚠️ CRITICAL
Your portfolio uses default credentials. Change them before going live:
- Default username: `admin`
- Default password: `admin123`

**To change:**
1. Go to http://localhost:3001/admin.html
2. Log in with `admin` / `admin123`
3. Click "Security" tab
4. Change both username and password
5. Save your new credentials somewhere safe

### 2. **Verify Email Configuration** (Optional but recommended)
- If you want contact form emails: Set up Gmail SMTP in `.env`
- If disabled: Contact form still works (saves locally)

### 3. **Test All Features**
- [ ] Gallery rotates smoothly
- [ ] Projects clickable
- [ ] Project details load
- [ ] Admin dashboard works
- [ ] Contact form submits
- [ ] Images load properly

---

## 🌍 Deployment Options

### **OPTION A: Render (Recommended - FREE)**
Easiest option, free tier available, automatic HTTPS.

**Steps:**
1. Create account at https://render.com
2. Connect your GitHub repository (push this project to GitHub first)
3. Create New > Web Service
4. Select your repository
5. Fill in:
   - **Name**: `sarra-portfolio` (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (if using email):
   - `PORT`: 3001
   - `NODE_ENV`: production
   - `GMAIL_USER`: your-gmail@gmail.com
   - `GMAIL_PASSWORD`: your-app-password
   - `SECRET_KEY`: create-a-random-strong-key
7. Click "Create Web Service"
8. Your site will be live at: `https://sarra-portfolio.onrender.com`

**Note**: Free tier may sleep after 15 minutes of inactivity. Upgrade to paid plan for always-on ($7/month).

---

### **OPTION B: Vercel (FREE - Best for Front-end)**
Good for static portfolio, but requires custom backend setup.

**Steps:**
1. Push to GitHub
2. Go to https://vercel.com
3. Import your project
4. Deploy
5. Your site: `https://your-portfolio.vercel.app`

**Limitation**: Vercel doesn't run Node.js servers on free tier. Use this if you only need the public portfolio (not admin dashboard).

---

### **OPTION C: Heroku (Paid - Reliable)**
Once free, now paid ($7/month minimum).

**Steps:**
1. Create account at https://heroku.com
2. Install Heroku CLI
3. Run: `heroku login`
4. Create app: `heroku create sarra-portfolio`
5. Deploy: `git push heroku main`
6. Your site: `https://sarra-portfolio.herokuapp.com`

---

### **OPTION D: Your Own Server (VPS)**
Advanced option - full control but requires Linux knowledge.
- Services: Digital Ocean, Linode, AWS, Azure
- Cost: $5-10/month
- Setup: Install Node.js, use PM2 for process management, Nginx as reverse proxy, SSL with Let's Encrypt

---

## 📋 Step-by-Step: Render Deployment (RECOMMENDED)

### **Step 1: Prepare Your Project**

```bash
# Make sure all changes are committed
git add .
git commit -m "Final portfolio before deployment"
```

### **Step 2: Push to GitHub**

```bash
# Create new repository on GitHub
# Then:
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### **Step 3: Deploy on Render**

1. Sign up: https://render.com (use GitHub account)
2. Click "New" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   ```
   Name: sarra-portfolio
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```
5. Click "Create Web Service"
6. Wait 2-3 minutes for deployment

### **Step 4: Set Environment Variables on Render**

1. Go to your service dashboard
2. Click "Environment"
3. Add variables:
   ```
   PORT=3001
   NODE_ENV=production
   SECRET_KEY=your-random-32-char-key-here
   GMAIL_USER=your-gmail@gmail.com (optional)
   GMAIL_PASSWORD=your-app-password (optional)
   ```

### **Step 5: Test Live Site**

1. Get your URL from Render dashboard
2. Visit: `https://your-service-name.onrender.com`
3. Test:
   - Gallery works
   - Projects clickable
   - Admin dashboard: `/admin.html`
   - Contact form submits

---

## 🔐 Security Checklist (BEFORE Going Live)

- [ ] Changed default admin password
- [ ] Set a strong `SECRET_KEY` in environment
- [ ] `.env` file is in `.gitignore` (don't commit secrets)
- [ ] `.admin-credentials.json` is in `.gitignore`
- [ ] Disabled debug mode: `NODE_ENV=production`
- [ ] HTTPS enabled (Render/Vercel/Heroku provide this)
- [ ] CORS properly configured (currently allows all origins)

---

## 📝 Optional: Update CORS for Security

If only your domain should access the API:

**In server.js, change:**
```javascript
app.use(cors());
```

**To:**
```javascript
app.use(cors({
    origin: ['https://your-domain.com', 'https://your-domain.onrender.com'],
    credentials: true
}));
```

---

## 🎯 Post-Deployment Checklist

- [ ] Site accessible at public URL
- [ ] All images load
- [ ] Gallery animations work
- [ ] Projects open when clicked
- [ ] Admin dashboard loads at `/admin.html`
- [ ] Contact form works
- [ ] No console errors (check browser DevTools)
- [ ] Test on mobile (responsive design)

---

## 📧 Custom Domain (Optional)

**For Render:**
1. Buy domain: GoDaddy, Namecheap, Google Domains
2. Go to Render dashboard → Settings → Custom Domain
3. Add your domain
4. Update DNS records (Render provides instructions)
5. Wait 24 hours for propagation
6. Your site: `https://yourname.com`

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot connect to server" | Make sure `PORT` env var is set |
| Admin dashboard blank | Check browser console (F12) for errors |
| Images not loading | Check URLs in projects.json |
| Contact form not working | Check `GMAIL_USER` settings (optional) |
| Slow after 15min idle | Upgrade Render from free tier |
| 502 Bad Gateway | Restart service in Render dashboard |

---

## 🚀 Go Live!

**Your deployment is complete when:**
1. ✅ Site loads without errors
2. ✅ Gallery and projects work
3. ✅ Admin dashboard is accessible
4. ✅ You have a public URL to share

**Share your portfolio:**
- LinkedIn
- Instagram
- Email
- Portfolio sites (Behance, ArtStation)
- Job applications

---

## 📞 Need Help?

- **Render Support**: https://render.com/docs
- **Express.js Docs**: https://expressjs.com
- **Node.js Guide**: https://nodejs.org/docs

Good luck! Your portfolio is going to impress clients! 🎨✨
