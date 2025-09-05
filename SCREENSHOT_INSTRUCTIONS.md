# PWA Screenshot Instructions

## To Add Screenshots Later

1. **Run your app locally:**
   ```bash
   npm run dev
   ```

2. **Take screenshots using Chrome DevTools:**
   - Open Chrome and navigate to your app
   - Press F12 to open DevTools
   - Click the device toolbar icon (mobile/tablet icon)
   - Select "iPhone 12 Pro" or similar mobile device
   - Navigate to key screens and take screenshots:
     - Home/Events page
     - Booking interface
     - Profile page

3. **Save screenshots as:**
   - `public/screenshot-1.png` (1080x1920 pixels)
   - `public/screenshot-2.png` (1080x1920 pixels)

4. **Add back to manifest.json:**
   ```json
   "screenshots": [
     {
       "src": "/screenshot-1.png",
       "sizes": "1080x1920", 
       "type": "image/png",
       "label": "Home screen showing available activities"
     },
     {
       "src": "/screenshot-2.png",
       "sizes": "1080x1920",
       "type": "image/png", 
       "label": "Event booking interface"
     }
   ]
   ```

## Why Screenshots Matter

- Improve PWA discoverability
- Show users what to expect
- Required for some app stores
- Enhance install prompts

For now, your PWA will work fine without them!
