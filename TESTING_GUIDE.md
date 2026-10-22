# Testing Guide - Responsive Layout & Image Loading

## Pre-Testing Setup

1. Ensure all images referenced in `projects.json` exist in the project root directory:
   - `07b82425c7c0b54221f7c172d5cc9207.jpg`
   - `7b66215884d73fe27a8259c423adb480.jpg`
   - `9e00c4087360356c79897015e2c2977b.jpg`
   - `Kriate Design Newsletter.jpg`

2. Start the development server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. Open browser to `http://localhost:3001`

---

## Desktop Testing (1920px & 1366px)

### Visual Checks:
- [ ] Circular gallery visible with your name centered inside
- [ ] Project cards arranged in a semi-circle around the center
- [ ] All project images load and display clearly
- [ ] Gallery size: ~900px width/height
- [ ] Cards approximately 140px wide × 175px tall
- [ ] Hover effects work smoothly (cards scale up slightly)
- [ ] Gallery auto-rotates continuously

### Image Tests:
- [ ] All 4 projects display with correct images
- [ ] Featured Projects section below shows all cards
- [ ] Project detail view shows full-size images
- [ ] Thumbnail gallery loads all images

### Interaction Tests:
- [ ] Click on any project card to view details
- [ ] Scroll to Featured Projects section - images load correctly
- [ ] View project details - images display without distortion

---

## Tablet Testing (768px & 1024px)

### Responsive Scaling:
- [ ] Gallery scales to smaller size (max 500px)
- [ ] Circular design maintained - not replaced with different layout
- [ ] Your name still centered inside the circle
- [ ] Cards scale proportionally
- [ ] No horizontal scrolling

### Gallery Display:
- [ ] Gallery remains visible (not hidden)
- [ ] All 4 project cards visible around circle
- [ ] Images quality maintained
- [ ] Rotation animation continues smoothly

### Interaction:
- [ ] Hover effects work (slight scale increase)
- [ ] Touch/click opens project details
- [ ] Scroll through featured projects section works

---

## Mobile Testing (480px & 320px)

### Critical Checks:
- [ ] Gallery visible - NOT replaced with different layout
- [ ] Gallery fits within viewport without overflow
- [ ] Circular design preserved at this size
- [ ] Gallery size: 200-400px (depending on viewport)
- [ ] Cards readable and clickable

### Image Loading:
- [ ] All project images load on mobile
- [ ] No broken image indicators
- [ ] Images scale properly (not stretched or squished)
- [ ] Featured projects section accessible by scrolling
- [ ] Detail view images display correctly

### Performance:
- [ ] No layout shift when images load
- [ ] Gallery rotation smooth and continuous
- [ ] Page responsive to touch interactions
- [ ] No console errors

### Landscape Testing (Mobile - 568px width):
- [ ] Gallery displays correctly in landscape
- [ ] Your name centered in the circle
- [ ] Cards visible and clickable

---

## Browser DevTools Testing

### Using Chrome/Firefox DevTools:

1. **Desktop View**:
   - Set viewport to 1920x1080
   - Verify gallery size ~900px

2. **Tablet View** (iPad):
   - Set viewport to 768x1024
   - Verify gallery resizes to ~500px

3. **Mobile View** (iPhone 12):
   - Set viewport to 390x844
   - Verify gallery resizes appropriately
   - Test both portrait and landscape

4. **Responsive Mode**:
   - Use DevTools responsive mode
   - Drag to resize browser window
   - Watch gallery smoothly scale with `clamp()`

---

## Image Path Verification

### In Browser Console:

1. **Check Arc Gallery Images**:
   ```javascript
   document.querySelectorAll('.arc-item-image').forEach((img, i) => {
       console.log(`Card ${i}:`, window.getComputedStyle(img).backgroundImage);
   });
   ```

2. **Check Featured Projects Images**:
   ```javascript
   document.querySelectorAll('.project-image').forEach((img, i) => {
       console.log(`Project ${i}:`, window.getComputedStyle(img).backgroundImage);
   });
   ```

3. **Verify No 404 Errors**:
   - Open DevTools Network tab
   - Filter by images
   - Should show successful loads (status 200)
   - No 404 or broken image icons

---

## Feature Verification Checklist

### Core Features:
- [ ] Circular gallery displays on all screen sizes
- [ ] Gallery design consistent (not replaced on mobile)
- [ ] Your name centered inside the circle
- [ ] Project cards arranged around circle
- [ ] All images load correctly

### Responsive Design:
- [ ] Desktop: Full-size gallery (~900px)
- [ ] Tablet: Medium gallery (~500px)
- [ ] Mobile: Compact gallery (~280-400px)
- [ ] No horizontal scrollbars
- [ ] No content hidden

### Image Loading:
- [ ] Arc gallery: All images visible
- [ ] Featured projects: All images loaded
- [ ] Detail view: Main image + thumbnails load
- [ ] No console errors about missing images
- [ ] Network requests show 200 status

### Interactions:
- [ ] Gallery rotates automatically
- [ ] Click/tap on projects opens detail view
- [ ] Hover effects work smoothly
- [ ] Scrolling between sections works
- [ ] All buttons clickable

---

## Troubleshooting

### If Images Don't Load:

1. Check browser console for errors:
   ```javascript
   // Check projects data
   console.log(projects);
   ```

2. Verify file paths:
   - Images should be in project root directory
   - Check projects.json for correct filenames
   - No leading slashes or wrong paths

3. Clear browser cache:
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open DevTools > Network tab > Disable cache

### If Gallery Doesn't Scale:

1. Check CSS is loaded:
   - DevTools > Styles tab
   - Search for `.arc-gallery`
   - Verify `clamp()` values present

2. Check JavaScript errors:
   - DevTools > Console tab
   - Look for initArcGallery errors

3. Verify viewport meta tag in HTML:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

### If Gallery Is Hidden on Mobile:

1. Check visibility:
   - `.arc-gallery-container` should have `display: flex`
   - Should NOT have `display: none` at any breakpoint

2. Verify z-index:
   - Should be `z-index: 5` for container
   - Should be higher than other elements

---

## Expected Results Summary

| Device | Gallery Size | Cards Size | Visible | Images Load |
|--------|-------------|-----------|---------|------------|
| Desktop 1920px | ~900px | 140x175px | ✓ Yes | ✓ Yes |
| Tablet 768px | ~500px | 120x150px | ✓ Yes | ✓ Yes |
| Mobile 480px | ~280-400px | 70-110px | ✓ Yes | ✓ Yes |
| Mobile 320px | ~200px | 60x75px | ✓ Yes | ✓ Yes |

---

## Sign-Off

- [ ] Desktop: Gallery and images working correctly
- [ ] Tablet: Gallery responsive, images load, design intact
- [ ] Mobile: Gallery visible, images load, no horizontal scroll
- [ ] All features tested and working as expected
- [ ] Ready for deployment

---

**Date Tested**: _______________  
**Tested By**: _______________  
**Issues Found**: None / [List any issues]
