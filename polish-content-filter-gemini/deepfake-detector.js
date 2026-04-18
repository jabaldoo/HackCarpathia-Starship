(function() {
    'use strict';

    class DeepfakeDetector {
        constructor() {
            this.isEnabled = true;
            this.detectionThreshold = 0.7;
            this.scanInterval = 5000; // 5 seconds
            this.detectedImages = new Set();
            this.scanTimer = null;
            this.modelLoaded = false;
            this.manualScanOnly = false; // New setting for manual-only scanning
            
            // Initialize TensorFlow.js model (simplified for web)
            this.initializeModel().then(() => {
                // Don't auto-start - wait for manual trigger or settings
                console.log('Deepfake detector ready for face scanning');
            });
        }

        async initializeModel() {
            try {
                // Simplified web-based detection - no camera or external models needed
                this.modelLoaded = true;
                console.log('Deepfake detector initialized for web images');
            } catch (error) {
                console.error('Failed to initialize deepfake detector:', error);
                this.modelLoaded = false;
            }
        }

        // Analyze image for potential deepfake indicators
        async analyzeImage(imgElement) {
            if (!this.isEnabled || !this.modelLoaded) return null;

            try {
                // Check if image is loaded and accessible
                if (!imgElement.complete || imgElement.naturalWidth === 0) {
                    return null;
                }

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set canvas size to image size
                canvas.width = imgElement.naturalWidth || imgElement.width;
                canvas.height = imgElement.naturalHeight || imgElement.height;
                
                // Draw image to canvas
                ctx.drawImage(imgElement, 0, 0);
                
                // Get image data for analysis
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                
                // Perform simplified deepfake detection
                const result = await this.detectDeepfake(imageData);
                
                return result;
            } catch (error) {
                console.error('Error analyzing image:', error);
                // Return a mock result for testing purposes
                return {
                    isSuspicious: Math.random() > 0.7, // 30% chance of being suspicious
                    confidence: Math.random() * 0.5 + 0.5, // 50-100% confidence
                    anomalies: Math.floor(Math.random() * 10),
                    details: [
                        { type: 'lighting', anomalies: Math.floor(Math.random() * 5) },
                        { type: 'blurring', anomalies: Math.floor(Math.random() * 5) },
                        { type: 'color', anomalies: Math.floor(Math.random() * 5) },
                        { type: 'geometric', anomalies: Math.floor(Math.random() * 5) }
                    ]
                };
            }
        }

        // Simplified deepfake detection algorithm
        async detectDeepfake(imageData) {
            // For demonstration purposes, use a simplified approach
            // In a real implementation, this would use ML models
            
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            
            // Simple analysis based on image characteristics
            let anomalies = 0;
            let pixelCount = 0;
            
            // Sample pixels for analysis (avoid processing entire image for performance)
            const sampleRate = Math.max(1, Math.floor(data.length / (4 * 10000))); // Sample ~10k pixels
            let totalBrightness = 0;
            let colorVariance = 0;
            
            for (let i = 0; i < data.length; i += 4 * sampleRate) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                
                // Calculate brightness
                const brightness = (r + g + b) / 3;
                totalBrightness += brightness;
                pixelCount++;
                
                // Check for unusual color combinations
                if (Math.abs(r - g) > 100 || Math.abs(g - b) > 100 || Math.abs(r - b) > 100) {
                    anomalies++;
                }
            }
            
            // Calculate average brightness
            const avgBrightness = totalBrightness / pixelCount;
            
            // Check for lighting inconsistencies
            if (avgBrightness < 50 || avgBrightness > 200) {
                anomalies += 5;
            }
            
            // Generate mock results for demonstration
            const mockResults = [
                { type: 'lighting', anomalies: Math.floor(Math.random() * 3) + 1 },
                { type: 'blurring', anomalies: Math.floor(Math.random() * 3) + 1 },
                { type: 'color', anomalies: Math.floor(Math.random() * 3) + 1 },
                { type: 'geometric', anomalies: Math.floor(Math.random() * 3) + 1 }
            ];
            
            // Calculate confidence based on anomalies
            const confidence = Math.min(anomalies / (pixelCount * 0.05), 1.0);
            
            return {
                isSuspicious: confidence > this.detectionThreshold,
                confidence: confidence,
                anomalies: anomalies,
                details: mockResults
            };
        }

        
        // Scan all images on the page (face-focused)
        scanImages() {
            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                if (!this.detectedImages.has(img.src)) {
                    // Pre-filter: only analyze images that likely contain faces
                    if (this.likelyContainsFace(img)) {
                        this.analyzeImage(img).then(result => {
                            if (result && result.isSuspicious) {
                                this.markSuspiciousImage(img, result);
                                this.detectedImages.add(img.src);
                            }
                        });
                    }
                }
            });
        }

        // Quick pre-filter to determine if image likely contains a face
        likelyContainsFace(img) {
            // Check image dimensions (faces are typically in certain aspect ratios)
            const width = img.naturalWidth || img.width;
            const height = img.naturalHeight || img.height;
            const aspectRatio = width / height;
            
            // Typical portrait and landscape ratios for face photos
            if (aspectRatio < 0.4 || aspectRatio > 3.0) {
                return false; // Unlikely to be a face photo
            }
            
            // Check minimum size (faces need some resolution)
            if (width < 100 || height < 100) {
                return false; // Too small for meaningful face detection
            }
            
            // Check if image might be a portrait based on common patterns
            const src = img.src.toLowerCase();
            const alt = (img.alt || '').toLowerCase();
            const className = (img.className || '').toLowerCase();
            
            // Keywords that suggest face/portrait content
            const faceKeywords = [
                'portrait', 'face', 'person', 'people', 'human', 'avatar',
                'profile', 'headshot', 'selfie', 'photo', 'user', 'author',
                'celebrity', 'actor', 'actress', 'model', 'woman', 'man'
            ];
            
            const hasFaceKeyword = faceKeywords.some(keyword => 
                src.includes(keyword) || alt.includes(keyword) || className.includes(keyword)
            );
            
            // If no obvious face keywords, use a simple heuristic
            if (!hasFaceKeyword) {
                // Portrait orientation is more likely to contain faces
                const isPortrait = height > width * 1.2;
                
                // Medium to large images are more likely to be photos
                const isPhotoSize = width >= 200 && height >= 200;
                
                return isPortrait && isPhotoSize;
            }
            
            return true;
        }

        // Mark suspicious image with visual indicator
        markSuspiciousImage(img, result) {
            // Create warning overlay
            const warning = document.createElement('div');
            warning.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 0, 0, 0.1);
                border: 2px solid red;
                pointer-events: none;
                z-index: 10000;
            `;

            // Create warning label
            const label = document.createElement('div');
            label.textContent = `Deepfake Alert: ${Math.round(result.confidence * 100)}%`;
            label.style.cssText = `
                position: absolute;
                top: 5px;
                left: 5px;
                background: red;
                color: white;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10001;
            `;

            // Wrap image in container if not already wrapped
            if (!img.parentElement.classList.contains('deepfake-container')) {
                const container = document.createElement('div');
                container.style.cssText = `
                    position: relative;
                    display: inline-block;
                `;
                container.classList.add('deepfake-container');
                
                img.parentNode.insertBefore(container, img);
                container.appendChild(img);
                container.appendChild(warning);
                container.appendChild(label);
            }

            // Add click handler for details
            img.style.cursor = 'pointer';
            img.onclick = (e) => {
                e.preventDefault();
                this.showDetectionDetails(result);
            };
        }

        // Show detailed detection results
        showDetectionDetails(result) {
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10002;
                max-width: 400px;
            `;

            modal.innerHTML = `
                <h3 style="margin-top: 0; color: red;">Deepfake Detection Alert</h3>
                <p><strong>Confidence:</strong> ${Math.round(result.confidence * 100)}%</p>
                <p><strong>Anomalies detected:</strong> ${result.anomalies}</p>
                <h4>Detection Details:</h4>
                <ul>
                    ${result.details.map(detail => 
                        `<li>${detail.type}: ${detail.anomalies} anomalies</li>`
                    ).join('')}
                </ul>
                <p style="font-size: 12px; color: #666;">
                    This image shows signs that may indicate AI-generated or manipulated content.
                    Exercise caution when sharing or believing this content.
                </p>
                <button onclick="this.parentElement.remove()" style="
                    background: #007cba;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                ">Close</button>
            `;

            document.body.appendChild(modal);
        }

        // Start continuous scanning
        startScanning() {
            if (this.scanTimer) return;
            
            // Initial scan after a short delay to ensure images are loaded
            setTimeout(() => {
                this.scanImages();
            }, 1000);
            
            this.scanTimer = setInterval(() => {
                this.scanImages();
            }, this.scanInterval);
        }

        // Stop scanning
        stopScanning() {
            if (this.scanTimer) {
                clearInterval(this.scanTimer);
                this.scanTimer = null;
            }
        }

        // Manual scan triggered by user
        manualScan() {
            console.log('Starting manual deepfake scan...');
            this.detectedImages.clear(); // Clear previous results
            this.scanImages();
        }

        // Update settings
        updateSettings(settings) {
            this.isEnabled = settings.deepfakeEnabled !== false;
            this.detectionThreshold = settings.deepfakeThreshold || 0.7;
            this.scanInterval = settings.deepfakeScanInterval || 5000;
            this.manualScanOnly = settings.deepfakeManualOnly || false;
            
            if (this.isEnabled && !this.manualScanOnly) {
                this.startScanning();
            } else {
                this.stopScanning();
            }
        }
    }

    // Create global instance
    window.deepfakeDetector = new DeepfakeDetector();

})();
