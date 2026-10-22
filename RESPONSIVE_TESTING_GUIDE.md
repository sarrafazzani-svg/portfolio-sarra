# Responsive Design Testing Guide

## Quick Test Checklist

### Desktop (1200px and above)
```
Browser: Chrome, Firefox, Safari, Edge
Resolution: 1920x1080, 1440x900, 1280x720

Expected Results:
□ Gallery displays at full 1400px width
□ Project cards are 160x200px each
□ Circle is fully visible with all cards arranged
□ Name is centered inside the circle
□ Auto-rotation runs smoothly
□ Hover effects work (scale up, lift up)
□ No layout shift on hover
```

### Tablet (768px - 1024px)
```
Devices: iPad (768/1024px), iPad Pro (1024px+), Android tablets
Orientation: Portrait and Landscape

Expected Results:
□ Gallery scales proportionally (width: 90vw max)
□ Project cards scale with viewport (12vw width, 15vw height)
□ Circle remains visible and centered
□ Cards still arranged in circular pattern
□ Name remains centered inside circle
□ All images load and display
□ No horizontal scrolling
□ Touch interactions work smoothly
```

### Mobile (360px - 480px)
```
Devices: iPhone SE (375px), iPhone 11 (390px), Samsung S21 (360px)
Orientation: Portrait primary

Expected Results:
□ Gallery scales down but stays visible
□ Project cards are readable (min 100px width)
□ Circle fits within viewport without cutting off
□ Name centered and readable
□ Images load properly
□ No gallery hidden or replaced with different layout
□ Tap cards to open detail view
□ Scroll smoothly through page
□ Portrait orientation displays correctly
```

## Step-by-Step Testing

### Test 1: Desktop View
1. Open DevTools (F12)
2. Disable device emulation (regular desktop view)
3. Verify:
   - Gallery has good spacing
   - All cards visible in circle
   - Auto-rotation working
   - Hover effects smooth

### Test 2: Tablet View
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPad" from device list
4. Verify:
   - Gallery scales down proportionally
   - All cards visible in circle
   - Name still centered
   - No layout shift when rotating

### Test 3: Mobile View
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select "iPhone 12" from device list
4. Verify:
   - Gallery visible and properly sized
   - Scroll works smoothly
   - Cards tappable
   - Text readable

### Test 4: Responsive Resize
1. Open DevTools (F12)
2. Select "Responsive" device mode
3. Drag window from 1920px to 320px
4. Verify:
   - Gallery scales smoothly at each size
   - No sudden layout jumps
   - Cards always visible
   - Arc radius recalculates properly

### Test 5: Image Loading
1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Verify:
   - All `.jpg` images load
   - Images show fallback gray if failed
   - No 404 errors in console
   - Gallery renders even if images are slow

## Common Issues & Fixes

### Issue: Gallery Too Large on Mobile
- **Check**: Browser width in DevTools
- **Fix**: Gallery uses `clamp(600px, 90vw, 1400px)` - if still too large, check viewport meta tag

### Issue: Cards Not Visible
- **Check**: Arc radius calculation (console.log in initArcGallery)
- **Fix**: Ensure `gallery.offsetWidth` is > 0 before calculating

### Issue: Images Not Loading
- **Check**: Image file paths in projects.json
- **Fix**: Paths should be relative (e.g., `07b82425c7c0b54221f7c172d5cc9207.jpg`)

### Issue: Name Not Centered
- **Check**: Hero content z-index (should be 20)
- **Fix**: Ensure gallery container z-index: 5 is lower than hero-content

### Issue: Rotation Choppy on Mobile
- **Check**: Animation speed (currently 0.015 per frame)
- **Fix**: Reduce speed on mobile or use CSS animation instead

## Performance Metrics

### Expected Page Load Times
- Desktop: < 2 seconds
- Tablet: < 2.5 seconds  
- Mobile: < 3 seconds

### GPU Usage
- Gallery rotation should use <10% GPU
- Use `will-change: transform` for hardware acceleration

## Browser DevTools Tips

### Chrome/Edge
1. F12 → Device Toolbar (Ctrl+Shift+M)
2. Select device or custom dimensions
3. Throttle: Normal → Fast 3G for mobile testing
4. Check Console for any JS errors

### Firefox
1. Ctrl+Shift+M → Responsive Design Mode
2. Select device or custom dimensions
3. Network tab to monitor image loading

### Safari
1. Develop → Enter Responsive Design Mode
2. Device selection at bottom
3. Console to check for errors

## Validation Checklist

Before deployment, verify:

```
☑ Gallery visible on all screen sizes
☑ Images load without errors
☑ Name stays centered in circle
☑ Project cards arranged around circle
☑ No horizontal scrolling
☑ No console errors
☑ Responsive resize works smoothly
☑ Touch/click interactions work
☑ Auto-rotation smooth
☑ Hover effects work on desktop
```

## Real Device Testing

For best results, test on actual devices:

**iOS**
- iPhone SE 2nd gen (375px)
- iPhone 12/13/14 (390px)
- iPhone 14 Pro Max (430px)
- iPad (768px, landscape 1024px)

**Android**
- Samsung Galaxy S10 (360px)
- Samsung Galaxy S21 (360px)
- Google Pixel 6 (412px)
- Samsung Galaxy Tab S7 (800px)

## Documentation References

- CSS clamp(): https://developer.mozilla.org/en-US/docs/Web/CSS/clamp
- Viewport units: https://developer.mozilla.org/en-US/docs/Learn/CSS/Building_blocks/Values_and_units
- Responsive Design: https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design
