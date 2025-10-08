# Convert SVG to PNG for App Icon and Splash Screen

## Quick Method: Use Online Converter

Since we created beautiful SVG designs, you can convert them to PNG using these methods:

### Method 1: Online Converter (Fastest)
1. Go to: https://cloudconvert.com/svg-to-png
2. Upload `assets/images/icon-design.svg`
3. Set dimensions: 1024x1024
4. Download as `icon.png`
5. Upload `assets/images/splash-design.svg`
6. Set dimensions: 1284x2778
7. Download as `splash.png`

### Method 2: Using Inkscape (Best Quality)
```bash
# Install Inkscape first: https://inkscape.org/release/

# Convert Icon
inkscape icon-design.svg --export-filename=icon.png --export-width=1024 --export-height=1024

# Convert Splash
inkscape splash-design.svg --export-filename=splash.png --export-width=1284 --export-height=2778
```

### Method 3: Using ImageMagick
```bash
# Install ImageMagick: https://imagemagick.org/script/download.php

# Convert Icon
magick convert -density 300 -background transparent icon-design.svg -resize 1024x1024 icon.png

# Convert Splash
magick convert -density 300 -background none splash-design.svg -resize 1284x2778 splash.png
```

### Method 4: Using Figma (Recommended for Customization)
1. Open https://www.figma.com
2. Create new file
3. Copy SVG code
4. Paste as SVG in Figma
5. Customize colors/text if needed
6. Export as PNG (1024x1024 for icon, 1284x2778 for splash)

## After Conversion

Place the PNG files in:
```
assets/images/icon.png       (1024x1024)
assets/images/splash.png     (1284x2778)
```

## Design Features

### App Icon (`icon.png`):
- ✨ Hand sign (peace/victory) in white
- 💬 Speech bubble with sound waves in green
- ⭐ AI sparkle effect
- 🎨 Purple-indigo gradient background
- 📱 "SignSpeak" text with "AI Powered" badge

### Splash Screen (`splash.png`):
- 🎨 Full-screen gradient (purple to indigo)
- 🤚 Large hand sign icon
- 💬 Animated speech bubble
- ✨ Floating sparkles
- 📝 "SignSpeak" title with subtitle
- 🏷️ Feature badges: "99% Accurate", "Real-Time", "Free"
- 🔄 Loading animation dots
- © Copyright notice

## Colors Used

- **Primary**: #4F46E5 (Indigo)
- **Secondary**: #7C3AED (Purple)
- **Accent**: #10B981 (Emerald)
- **Gold**: #FCD34D (Yellow)
- **White**: #FFFFFF

These match your app theme perfectly!

## Quick Test

After placing PNG files, test with:
```bash
npm start
```

The splash screen will show when the app loads!
