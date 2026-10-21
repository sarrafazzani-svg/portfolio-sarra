# Video Upload System - Complete Guide

## What Changed

The video upload system has been completely rebuilt to handle actual video files on the server instead of storing them as data in localStorage.

### Key Improvements

✅ **Server-Side Storage**: Videos are now uploaded to `/uploads` folder on the server
✅ **Correct URLs**: Video paths are stored as `/uploads/filename.mp4` 
✅ **File Size Support**: Handles videos up to 500MB
✅ **Preview**: Video preview works in admin panel before upload
✅ **Portfolio Playback**: Videos play correctly on portfolio page with fullscreen support
✅ **Error Handling**: Proper error messages for upload failures
✅ **All Features Intact**: Images, links, and all other features still work

## How It Works

### Admin Panel Upload Process

1. **Select Video File**
   - Go to Admin Dashboard: `http://localhost:3001/admin.html`
   - Click "Add New" or "Edit" project
   - Select a video file in "Video/File" field
   - Video preview appears showing duration and playback controls

2. **Upload to Server**
   - When you click "Save Project", the video is uploaded via FormData
   - Server saves file to `uploads/` folder with timestamp filename
   - Database stores the URL: `/uploads/1234567890.mp4`

3. **Sync to Portfolio**
   - Projects.json on server is automatically updated
   - Portfolio page loads projects with correct video URLs

### Portfolio Page Usage

1. **View Project**
   - Go to Portfolio: `http://localhost:3001/index.html`
   - Click on a project to see details
   - If project has video: "Watch Video ▶" button appears
   - If project has link: "More ▶" button appears

2. **Watch Video**
   - Click "Watch Video ▶" button
   - Video opens in fullscreen modal
   - All HTML5 video controls available:
     - Play/Pause
     - Volume control
     - Fullscreen button
     - Seek bar

## File Structure

```
portSarra/
├── uploads/                      # New folder (auto-created)
│   ├── 1695234567890.mp4        # Uploaded videos
│   ├── 1695234567891.jpg        # Uploaded images
│   └── ...
├── admin.html                    # Admin dashboard
├── index.html                    # Portfolio page
├── admin.js                      # Admin logic (updated)
├── script.js                     # Portfolio logic
├── server.js                     # Server with video upload support
├── projects.json                 # Project database
└── styles.css                    # Styling
```

## API Endpoints

### Create Project (with video)
```
POST /api/admin/projects
Content-Type: multipart/form-data

Fields:
- title (text)
- category (text)
- overview (text)
- challenge (text)
- solution (text)
- tools (JSON array)
- link (text)
- thumbnail (file)
- images (files - multiple)
- video (file - single)
```

### Update Project (with video)
```
PUT /api/admin/projects/:id
Content-Type: multipart/form-data

Same fields as POST
```

### Get All Projects
```
GET /api/projects
Returns: Array of all projects with correct video URLs
```

## Video Format Support

✅ Supported formats:
- MP4 (.mp4)
- WebM (.webm)
- QuickTime (.mov)

✅ File size: Up to 500MB

## Troubleshooting

### Video shows black screen
**Solution**: Refresh the page to ensure correct URL is loaded

### Video upload fails
**Check**: 
1. File size under 500MB
2. Correct format (MP4, WebM, or MOV)
3. Server is running (`node server.js`)
4. Check browser console for error messages

### Video preview doesn't show in admin
**Check**:
1. Video file format is supported
2. File is valid (not corrupted)
3. Browser supports HTML5 video

### Upload folder permissions error
**Solution**: 
1. Make sure the portfolio folder has write permissions
2. Try deleting the `uploads` folder and restarting server
3. Server will recreate it automatically

## Best Practices

1. **Video Format**: Use MP4 format (most compatible)
2. **File Size**: Keep under 100MB for faster uploads
3. **Resolution**: 720p or 1080p recommended
4. **Codec**: H.264 video codec (widely supported)

## Example Project with Video

```json
{
  "id": 9,
  "title": "My Video Project",
  "category": "Animation",
  "image": "/uploads/1695234567891.jpg",
  "images": ["/uploads/1695234567891.jpg"],
  "video": "/uploads/1695234567890.mp4",
  "link": "https://figma.com/project",
  "overview": "Amazing video project",
  "challenge": "Create engaging animation",
  "solution": "Used After Effects",
  "tools": ["After Effects", "Animation"]
}
```

## Server Management

### Start Server
```bash
node server.js
```

### Server runs at
```
http://localhost:3001
```

### Access Points
- Admin: `http://localhost:3001/admin.html`
- Portfolio: `http://localhost:3001/index.html`
- API: `http://localhost:3001/api/projects`

## Security Notes

⚠️ **Important**: 
- Current system uses simple authentication
- For production, implement proper JWT tokens
- Consider adding password hashing for admin login
- Validate file types on server and client
- Set file upload limits as needed
