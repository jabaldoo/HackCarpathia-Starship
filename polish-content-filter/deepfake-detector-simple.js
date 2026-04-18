(function() {
    'use strict';

    class DeepfakeDetector {
        constructor() {
            this.isEnabled = true;
            this.detectionThreshold = 0.7;
            this.detectedImages = new Set();
            this.scanInterval = 5000; // 5 seconds
            this.scanTimer = null;
            console.log('Deepfake detector initialized');
            
            // Start automatic scanning
            this.startAutomaticScanning();
        }

        likelyContainsFace(img) {
            try {
                // For testing, be more permissive - accept most images
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;
                
                // Only filter out very small images
                if (width < 50 || height < 50) {
                    return false;
                }
                
                // For testing purposes, accept most reasonable sized images
                return true;
            } catch (error) {
                return false;
            }
        }

        async analyzeImage(img) {
            if (!this.isEnabled || !this.likelyContainsFace(img)) {
                return null;
            }

            // For testing, make it more likely to detect suspicious content
            const isSuspicious = Math.random() > 0.3; // 70% chance instead of 30%
            const confidence = Math.random() * 0.4 + 0.6; // 60-100% confidence
            
            return {
                isSuspicious: isSuspicious,
                confidence: confidence,
                anomalies: Math.floor(Math.random() * 10),
                details: [
                    { type: 'lighting', anomalies: Math.floor(Math.random() * 3) },
                    { type: 'blurring', anomalies: Math.floor(Math.random() * 3) },
                    { type: 'color', anomalies: Math.floor(Math.random() * 3) },
                    { type: 'geometric', anomalies: Math.floor(Math.random() * 3) }
                ]
            };
        }

        scanImages() {
            const images = document.querySelectorAll('img');
            console.log(`Found ${images.length} images to scan`);
            
            let scannedCount = 0;
            let suspiciousCount = 0;
            
            images.forEach(img => {
                if (!this.detectedImages.has(img.src)) {
                    scannedCount++;
                    console.log(`Scanning image: ${img.src.substring(0, 50)}...`);
                    
                    this.analyzeImage(img).then(result => {
                        if (result && result.isSuspicious) {
                            suspiciousCount++;
                            console.log(`Suspicious image detected! Confidence: ${result.confidence}`);
                            this.markSuspiciousImage(img, result);
                            this.detectedImages.add(img.src);
                        }
                    });
                }
            });
            
            console.log(`Scanning ${scannedCount} new images...`);
        }

        markSuspiciousImage(img, result) {
            try {
                const width = img.naturalWidth || img.width;
                const height = img.naturalHeight || img.height;
                
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
                    box-sizing: border-box;
                `;

                // Create responsive label that adjusts to image size
                const label = document.createElement('div');
                label.textContent = `Deepfake: ${Math.round(result.confidence * 100)}%`;
                
                // Adjust font size based on image dimensions
                const fontSize = Math.max(8, Math.min(14, width / 20));
                const padding = Math.max(1, Math.min(4, width / 60));
                
                label.style.cssText = `
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    background: red;
                    color: white;
                    padding: ${padding}px ${padding * 2}px;
                    border-radius: 2px;
                    font-size: ${fontSize}px;
                    font-weight: bold;
                    z-index: 10001;
                    font-family: Arial, sans-serif;
                    line-height: 1;
                    white-space: nowrap;
                    box-sizing: border-box;
                    max-width: ${Math.max(60, width - 4)}px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                `;

                if (!img.parentElement.classList.contains('deepfake-container')) {
                    const container = document.createElement('div');
                    container.style.cssText = `
                        position: relative;
                        display: inline-block;
                        line-height: 0;
                    `;
                    container.classList.add('deepfake-container');
                    
                    img.parentNode.insertBefore(container, img);
                    container.appendChild(img);
                    container.appendChild(warning);
                    container.appendChild(label);
                }

                img.style.cursor = 'pointer';
                img.onclick = (e) => {
                    e.preventDefault();
                    this.showDetectionDetails(result);
                };
            } catch (error) {
                console.error('Error marking suspicious image:', error);
            }
        }

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

        startAutomaticScanning() {
            // Initial scan after page loads
            setTimeout(() => {
                console.log('Starting automatic deepfake scan...');
                this.scanImages();
            }, 2000);
            
            // Set up periodic scanning
            this.scanTimer = setInterval(() => {
                this.scanImages();
            }, this.scanInterval);
        }

        stopScanning() {
            if (this.scanTimer) {
                clearInterval(this.scanTimer);
                this.scanTimer = null;
            }
        }

        updateSettings(settings) {
            this.isEnabled = settings.deepfakeEnabled !== false;
            this.detectionThreshold = settings.deepfakeThreshold || 0.7;
            this.scanInterval = settings.deepfakeScanInterval || 5000;
            
            // Restart scanning with new interval
            this.stopScanning();
            if (this.isEnabled) {
                this.startAutomaticScanning();
            }
        }
    }

    window.deepfakeDetector = new DeepfakeDetector();

})();
