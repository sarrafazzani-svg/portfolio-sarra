# Email Setup Guide - Receive Contact Form Messages in Gmail

## How It Works

When someone submits the contact form on your portfolio, an email is automatically sent to your Gmail inbox!

## Setup Steps

### Step 1: Get Your Gmail App Password

1. Go to: **https://myaccount.google.com/security**
2. Click **"2-Step Verification"** (if not already enabled, enable it first)
3. Scroll down and click **"App passwords"**
4. Select Device: **Windows Computer**
5. Select App: **Mail**
6. Google will generate a 16-character password
7. **Copy this password** - you'll need it

### Step 2: Create Environment File

1. Open Notepad
2. Paste this (replace with YOUR Gmail):

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=xxxx xxxx xxxx xxxx
```

3. Replace:
   - `your-email@gmail.com` with your actual Gmail address
   - `xxxx xxxx xxxx xxxx` with the 16-character password from Step 1

4. Save as **`.env`** in your portfolio folder:
   - Location: `C:\Users\SARRA\Downloads\portSarra\.env`
   - Important: Make sure it says `.env` not `.env.txt`

### Step 3: Install dotenv Package

1. Open Command Prompt
2. Navigate to portfolio folder:
   ```
   cd C:\Users\SARRA\Downloads\portSarra
   ```
3. Install dotenv:
   ```
   npm install dotenv
   ```

### Step 4: Update Server Code

Add this at the very top of `server.js` (after other requires):

```javascript
require('dotenv').config();
```

It should look like:
```javascript
const express = require('express');
const cors = require('cors');
// ... other imports ...
require('dotenv').config();  // Add this line here
```

### Step 5: Restart Server

1. Stop the current server (Ctrl + C in command window)
2. Start it again: `node server.js`
3. You should see: **✅ Email service ready**

## Test It

1. Go to: `http://localhost:3001/index.html`
2. Scroll to Contact section
3. Fill in form:
   - Name: Test
   - Email: any email
   - Message: Testing email
4. Click "Send Message"
5. **Check your Gmail inbox!** 📧

## What You'll Receive

**Email looks like:**
```
Subject: New Portfolio Contact: [Person's Name]

New Contact Form Submission

Name: John Doe
Email: john@example.com
Message:
Hello, I'm interested in your work...
```

## Troubleshooting

### "Email service ready" not showing
- Check .env file location: `C:\Users\SARRA\Downloads\portSarra\.env`
- Check Gmail and password are correct
- Make sure dotenv is installed: `npm install dotenv`

### Email not arriving
1. Check spam/promotions folder
2. Verify Gmail app password (not regular password)
3. Ensure 2-Step Verification is enabled
4. Check server console for error messages

### "Failed to send message"
- Wrong Gmail or password
- 2-Step Verification not enabled
- Gmail account security settings blocking

## Security Notes

⚠️ **IMPORTANT:**
- Never share your `.env` file
- Never commit it to version control
- Never post the password online
- Use App Password, not your regular Gmail password

## Quick Checklist

✅ Gmail account with 2-Step Verification enabled
✅ 16-character App Password generated
✅ `.env` file created with credentials
✅ `dotenv` package installed
✅ `require('dotenv').config()` added to server.js
✅ Server restarted

## After Setup

**Everything works automatically:**
- Contact form sends email to your Gmail
- You receive notification immediately
- Can reply from Gmail to the sender's email
- New submissions keep arriving

## Example .env File

```
GMAIL_USER=sarra@gmail.com
GMAIL_PASSWORD=abcd efgh ijkl mnop
```

(This is just an example - use YOUR actual credentials)

## Help

If emails aren't working:
1. Check browser console (F12) for errors
2. Check server console for messages
3. Verify .env file exists and has correct format
4. Restart server after making changes
