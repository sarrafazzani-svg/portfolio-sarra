# 🚀 Quick Start: Deploy in 5 Minutes

## The Fastest Way to Get Live

### **Choose Your Platform:**

---

## ⚡ **Option 1: Render (EASIEST - Recommended)**

### Pre-requisites:
- GitHub account
- Your project pushed to GitHub

### Deploy:
1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect GitHub and select your repo
4. Fill in:
   - **Name**: `sarra-portfolio`
   - **Environment**: Node
   - **Build**: `npm install`
   - **Start**: `npm start`
5. Click "Create Web Service"
6. **Done!** Your site is live at the URL shown on dashboard

### Add Environment Variables:
1. Go to "Environment" tab
2. Add these:
   ```
   PORT=3001
   NODE_ENV=production
   SECRET_KEY=generate-a-random-string-here
   ```
3. Service auto-restarts with new variables

---

## 🌐 **Option 2: Vercel (For Portfolio Only)**

Works well if you only need the public portfolio (no admin dashboard).

1. Go to https://vercel.com
2. Import from GitHub
3. Deploy
4. Done!

**Limitation**: Backend API won't work on free tier.

---

## 🎯 **Step-by-Step for Render:**

### Step 1: Create GitHub Repository
```bash
git init
git add .
git commit -m "Portfolio ready to deploy"
git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Render
1. Sign up at https://render.com
2. Click "New" → "Web Service"
3. Select "GitHub" and authorize
4. Choose your repository

### Step 3: Configure Service
```
Name: sarra-portfolio
Root Directory: .
Environment: Node
Build Command: npm install
Start Command: npm start
```

### Step 4: Set Environment Variables
After clicking "Create Web Service", go to:
**Settings** → **Environment** → Add:

| Key | Value |
|-----|-------|
| `PORT` | `3001` |
| `NODE_ENV` | `production` |
| `SECRET_KEY` | *(generate random string)* |

### Step 5: Deploy
Render auto-deploys on push. To see logs:
- Go to dashboard
- Click your service
- Check "Logs" tab

### Step 6: Get Your URL
Once deployed (2-3 min):
- Your site: `https://sarra-portfolio.onrender.com`
- Admin: `https://sarra-portfolio.onrender.com/admin.html`

---

## ✅ Test Your Live Site

1. Visit your public URL
2. [ ] Gallery loads and rotates
3. [ ] Click a project → opens details
4. [ ] Go to `/admin.html` → login works
5. [ ] Contact form submits (check at `/admin.html` Messages)

---

## 🎁 Bonus: Custom Domain

After deployment:
1. Buy domain (GoDaddy, Namecheap, etc.)
2. On Render dashboard → "Settings" → "Custom Domain"
3. Add your domain
4. Follow DNS setup instructions
5. Wait 24 hours for DNS to propagate
6. Your site: `https://yourname.com`

---

## 💡 Pro Tips

- **Free tier limitation**: Render spins down free services after 15 min inactivity (takes 30 sec to wake)
- **For always-on**: Upgrade to paid plan ($7/month)
- **Environment variables**: Never commit `.env` file to GitHub
- **Admin password**: Change it before going live!

---

## 🆘 Quick Troubleshooting

```
Service won't start?
→ Check logs for error messages

Images not loading?
→ Verify image URLs in projects.json

Admin dashboard blank?
→ Open browser console (F12) → check for errors

Contact form not working?
→ Check GMAIL settings are correct (or disable for local only)
```

---

## 🎉 You're Live!

Your portfolio is now on the internet! Share your URL:
- LinkedIn profile
- Email signature
- Job applications
- Social media

Good luck attracting clients! 🚀
