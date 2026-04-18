# FakeLess - All-in-One Protection Extension

FakeLess combines AI image detection, video call deepfake protection, and content filtering into one unified addon.

## Features

### 1. Web AI Scanner (`gemini-scanner.js`)
- Detects AI-generated images on all websites
- Uses local analysis (no API key needed) or Google Gemini API
- Highlights suspicious images with confidence scores
- Works automatically in the background

### 2. Video Call Protection (`video-call-scanner.js`)
- Detects deepfakes in real-time video calls
- Supports Google Meet, Zoom, Microsoft Teams
- Shows floating widget with live analysis
- Draws face boxes around detected faces with risk scores
- Requires Google Gemini API key

### 3. Content Filtering (`content-filter.js`)
- Filters Polish swear words (replaces with #)
- Blocks adult/pornographic websites
- Blocks Google searches for adult content
- Shows "You can't get here / Go back to safe seas" message
- Auto-redirects to google.com

## Setup

### 1. Install in Firefox
1. Open `about:debugging` in Firefox
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select `manifest.json` from the FakeLess folder

### 2. Configure API Key (Optional but recommended)
**Option A - Options Page:**
- Click the FakeLess icon → Options
- Enter your Google Gemini API key
- Click Save

**Option B - .env File:**
Create a `.env` file in the FakeLess folder with:
```
GOOGLE_API_KEY=your_api_key_here
```

### 3. Get Free API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Create a new API key
4. Copy and paste into FakeLess settings

## Usage

### Web Browsing
- AI scanner runs automatically on all pages
- Detected AI images show percentage badge
- Red border for high confidence detections

### Video Calls
1. Join a Google Meet, Zoom, or Teams call
2. FakeLess widget appears automatically
3. Click "START LIVE SCAN" to begin analysis
4. Watch for real-time deepfake detection
5. Face box shows around detected faces with color-coded risk:
   - Green (0-25%): Real
   - Blue (26-50%): Likely Real
   - Yellow (51-75%): Suspicious
   - Red (76-100%): Fake

## File Structure
```
FakeLess/
├── manifest.json          # Extension configuration
├── background.js          # API key loading from .env
├── gemini-scanner.js      # Web image AI detection
├── video-call-scanner.js  # Video call deepfake widget
├── video-call-widget.css  # Widget styling
├── content-filter.js      # Word + adult content filtering
├── options.html           # Settings page
├── options.js             # Settings logic
├── .env                   # API key storage (optional)
├── logo_bez_tla.png       # Extension icon
├── logo/                  # Logo folder
└── lvl/                   # Trust level icons (1-4)
```

## Mobile Version

For Firefox Mobile (Android), use the `FakeLess-Mobile/` folder which has:
- Simplified permissions (no `tabs.captureVisibleTab`)
- Optimized performance for mobile devices
- Touch-friendly options UI
- Battery-optimized scanning intervals
- No video call widget (mobile browsers handle video differently)

## Notes

- Local detection works without API key (less accurate)
- API key enables better detection via Google Gemini
- Adult blocking works immediately without setup
- All features can be toggled in Options

## License
MIT License - HackCarpathia Starship Project
