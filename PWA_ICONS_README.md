# PWA Icons Setup

The app requires PWA icons in various sizes. You can generate them easily:

## Option 1: Using an Online Tool (Easiest)

1. Go to https://www.pwabuilder.com/imageGenerator
2. Upload your logo/icon (512x512px recommended)
3. Download the generated icons
4. Place them in `/public/icons/` folder

## Option 2: Using a Script

Install sharp (already in package.json):
```bash
npm install
```

Create a script `generate-icons.js`:
```javascript
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const inputImage = './public/icon-source.png'; // Your source icon
const outputDir = './public/icons/';

// Create icons directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach(size => {
  sharp(inputImage)
    .resize(size, size)
    .toFile(path.join(outputDir, `icon-${size}x${size}.png`))
    .then(() => console.log(`Generated ${size}x${size} icon`))
    .catch(err => console.error(`Error generating ${size}x${size}:`, err));
});
```

Run:
```bash
node generate-icons.js
```

## Option 3: Quick Placeholder Icons

For development, you can use a simple colored square:

1. Create a 512x512px PNG with your brand color
2. Add a coffee emoji or simple logo
3. Use Option 2 to generate all sizes

## Required Sizes

- 72x72
- 96x96
- 128x128
- 144x144
- 152x152
- 192x192
- 384x384
- 512x512

All icons should be saved as `icon-{size}x{size}.png` in `/public/icons/`

## Testing PWA

After adding icons:

1. Run `npm run build && npm start`
2. Open in Chrome
3. Check DevTools > Application > Manifest
4. Verify all icons load correctly
5. Test "Add to Home Screen"

## Production Notes

- Icons are cached by service worker
- Update service worker version when changing icons
- Test on actual mobile devices
- Ensure icons look good on both light/dark backgrounds
