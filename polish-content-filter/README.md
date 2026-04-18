# Polish Content Filter & Deepfake Scanner

Firefox extension that filters Polish swear words, insults and negative content by replacing them with #, plus includes a deepfake scanner for detecting AI-generated or manipulated images.

## Features

### Content Filtering
- **Comprehensive Filtering**: Extensive dictionary of Polish swear words, insults and negative terms
- **Smart Replacement**: Replaces offensive words with # while preserving word length
- **Real-time Processing**: Filters content as it loads and dynamically added content
- **Customizable Settings**: Options page with various filtering preferences
- **Statistics**: Tracks filtered words and processed pages

### Deepfake Scanner
- **Image Analysis**: Scans images for signs of AI generation or manipulation
- **Visual Warnings**: Marks suspicious images with red borders and confidence scores
- **Detailed Reports**: Click suspicious images to see detailed analysis
- **Automatic Scanning**: Continuously scans new images as they load
- **Customizable Thresholds**: Adjust detection sensitivity and scan frequency

## Installation

### Temporary Installation (for testing)

1. Open Firefox
2. Go to `about:debugging` in the address bar
3. Click on "This Firefox"
4. Click "Load Temporary Add-on..."
5. Select the `manifest.json` file from this directory
6. The extension is now installed and active

### Permanent Installation

1. Package the extension as a .xpi file
2. Install through Firefox Add-ons store or side-loading

## Testing

### Content Filter Testing
1. After installation, open the `test.html` file in your browser
2. Observe how offensive words are replaced with #
3. Test different settings in the options page:
   - Right-click the extension icon
   - Select "Options" or go to `about:addons` and find the extension

### Deepfake Scanner Testing
1. Open the `deepfake-test.html` file in your browser
2. Observe how images are scanned for manipulation signs
3. Click on suspicious images to see detailed analysis
4. Test different detection thresholds and scan frequencies in options

## Files Structure

```
polish-content-filter/
|-- manifest.json          # Extension manifest
|-- content.js            # Main content script with filtering logic
|-- deepfake-detector.js  # Deepfake scanning functionality
|-- options.html          # Options page UI
|-- options.js            # Options page functionality
|-- test.html             # Test page for content filter
|-- deepfake-test.html    # Test page for deepfake scanner
|-- README.md             # This file
```

## Settings

The extension offers the following customizable options:

### Filtering Settings
- **Enable Filter**: Turn filtering on/off
- **Replace with #**: Choose between replacing with # or complete removal
- **Replacement Character**: Choose the character to replace with
- **Filter Strength**: Choose between strict, moderate, or light filtering

### Exclusions
- **Social Media**: Enable/disable filtering on social platforms
- **Forums**: Enable/disable filtering on discussion forums
- **News Sites**: Enable/disable filtering on news websites

### Deepfake Scanner Settings
- **Enable Scanner**: Turn deepfake detection on/off
- **Detection Threshold**: Set sensitivity level (50%, 70%, 90%)
- **Scan Frequency**: Choose how often to scan images (3s, 5s, 10s)
- **Show Warnings**: Display visual alerts on suspicious images

## Dictionary

The extension includes over 300 Polish offensive words including:

- Basic swear words
- Personal insults
- Negative adjectives
- Racial/ethnic slurs
- Gender-based insults
- Vulgar expressions

## Technical Details

### Content Script
- Runs on all URLs (`<all_urls>`)
- Processes text nodes recursively
- Uses MutationObserver for dynamic content
- Preserves word length when replacing

### Storage
- Uses `browser.storage.sync` for settings
- Uses `browser.storage.local` for statistics
- Settings persist across browser sessions

### Compatibility
- Firefox 57+ (Manifest V2)
- Works on all websites
- Minimal performance impact

## Troubleshooting

### Extension not working
1. Check if extension is enabled in `about:addons`
2. Verify permissions are granted
3. Try reloading the page
4. Check browser console for errors

### Words not being filtered
1. Check if filter is enabled in options
2. Verify filter strength setting
3. Check if site is excluded from filtering

### Performance issues
1. The extension is optimized for minimal impact
2. If issues occur, try disabling on specific sites
3. Consider using lighter filter strength

## Privacy

This extension:
- Does not collect personal data
- Does not track browsing history
- Works entirely offline
- Stores only local settings and statistics

## License

MIT License - feel free to modify and distribute.

## Contributing

To add more words to the dictionary:
1. Edit `content.js`
2. Add words to the `offensiveWords` array
3. Ensure proper declensions are included
4. Test with the `test.html` file

## Support

For issues or suggestions:
- Check the troubleshooting section
- Test with the provided test file
- Verify settings are correct
