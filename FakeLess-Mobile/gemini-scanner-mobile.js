// FakeLess Mobile - Local AI Image Scanner
// Mobile-optimized: Uses local analysis only (no screenshot API on mobile)

(function() {
    'use strict';

    class GeminiAIScannerMobile {
        constructor() {
            this.isEnabled = true;
            this.apiKey = null;
            this.scanInterval = 15000; // Slower interval for mobile battery
            this.scanTimer = null;
            this.isScanning = false;
            this.detectedImages = new Set();
            this.useLocalDetection = true; // Mobile always uses local
            
            console.log('FakeLess Mobile: AI Scanner initialized');
            this.loadSettings();
        }

        async loadSettings() {
            try {
                let settings = await browser.storage.sync.get({
                    geminiEnabled: true,
                    geminiApiKey: '',
                    geminiScanInterval: 15000,
                    geminiShowWarnings: true
                });
                
                // Also check local storage for API key
                const localData = await browser.storage.local.get('geminiApiKey');
                if (localData.geminiApiKey && !settings.geminiApiKey) {
                    settings.geminiApiKey = localData.geminiApiKey;
                    await browser.storage.sync.set({ geminiApiKey: localData.geminiApiKey });
                }
                
                this.isEnabled = settings.geminiEnabled;
                this.apiKey = settings.geminiApiKey;
                this.scanInterval = settings.geminiScanInterval;
                
                if (this.isEnabled) {
                    this.startLocalScanning();
                }
            } catch (error) {
                console.error('FakeLess Mobile: Error loading settings:', error);
            }
        }

        startLocalScanning() {
            // Delay initial scan for mobile page load
            setTimeout(() => {
                this.performLocalAnalysis();
            }, 5000);
            
            // Set up periodic scanning
            this.scanTimer = setInterval(() => {
                this.performLocalAnalysis();
            }, this.scanInterval);
        }

        stopScanning() {
            if (this.scanTimer) {
                clearInterval(this.scanTimer);
                this.scanTimer = null;
            }
        }

        async updateSettings(settings) {
            this.isEnabled = settings.geminiEnabled !== false;
            this.apiKey = settings.geminiApiKey || '';
            this.scanInterval = settings.geminiScanInterval || 15000;
            
            this.stopScanning();
            if (this.isEnabled) {
                this.startLocalScanning();
            }
        }

        async manualScan() {
            this.showNotification('Analizowanie obrazów...', 'info');
            await this.performLocalAnalysis();
        }

        // Mobile-optimized local analysis
        async performLocalAnalysis() {
            if (this.isScanning || !this.isEnabled) return;
            
            this.isScanning = true;
            console.log('FakeLess Mobile: Starting local analysis...');
            
            const images = document.querySelectorAll('img');
            let aiImageCount = 0;
            let analyzedCount = 0;
            
            // Limit analysis for mobile performance
            const maxImagesToAnalyze = 15;
            const imagesToAnalyze = Array.from(images).slice(0, maxImagesToAnalyze);
            
            for (const img of imagesToAnalyze) {
                // Skip small images
                if (img.width < 100 || img.height < 100) continue;
                
                // Skip already analyzed
                if (img.dataset.aiAnalyzedMobile) continue;
                
                // Skip images that haven't loaded
                if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
                    continue;
                }
                
                try {
                    const score = await this.analyzeImageLocally(img);
                    
                    if (score > 0.35) { // Slightly higher threshold for mobile
                        aiImageCount++;
                        this.showImagePercentage(img, score);
                    }
                    
                    img.dataset.aiAnalyzedMobile = 'true';
                    analyzedCount++;
                    
                    // Small delay to prevent blocking UI
                    await new Promise(resolve => setTimeout(resolve, 50));
                    
                } catch (e) {
                    // Try URL-based fallback
                    if (e.message && (e.message.includes('CORS') || e.message.includes('insecure'))) {
                        try {
                            const fallbackScore = this.analyzeImageByURL(img);
                            if (fallbackScore > 0.45) {
                                aiImageCount++;
                                this.showImagePercentage(img, fallbackScore);
                            }
                            img.dataset.aiAnalyzedMobile = 'true';
                            analyzedCount++;
                        } catch (fallbackErr) {
                            // Silent fail on mobile
                        }
                    }
                }
            }
            
            console.log(`Mobile analysis: ${analyzedCount} analyzed, ${aiImageCount} AI detected`);
            
            if (aiImageCount > 0) {
                this.showNotification(`Wykryto ${aiImageCount} potencjalnych AI-obrazów`, 'warning');
            }
            
            this.isScanning = false;
        }

        analyzeImageByURL(img) {
            const src = img.src || '';
            let score = 0.1;
            
            const aiPatterns = [
                /openai/i, /dalle/i, /midjourney/i, /stable-diffusion/i,
                /craiyon/i, /dreamstudio/i, /nightcafe/i, /artbreeder/i,
                /thispersondoesnotexist/i, /generated/i, /ai-art/i,
                /deepdream/i, /wombo/i, /starryai/i, /jasper/i
            ];
            
            const aiSizes = [256, 512, 768, 1024];
            if (aiSizes.includes(img.naturalWidth) && aiSizes.includes(img.naturalHeight)) {
                if (img.naturalWidth === img.naturalHeight) {
                    score += 0.15;
                }
            }
            
            for (const pattern of aiPatterns) {
                if (pattern.test(src)) {
                    score += 0.3;
                    break;
                }
            }
            
            if (/\/[a-f0-9]{16,32}/i.test(src)) {
                score += 0.1;
            }
            
            return Math.min(score, 0.7);
        }

        async analyzeImageLocally(img) {
            return new Promise((resolve, reject) => {
                if (!img.naturalWidth || !img.naturalHeight || img.naturalWidth === 0 || img.naturalHeight === 0) {
                    reject(new Error('Invalid image dimensions'));
                    return;
                }
                
                const tryAnalyze = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Smaller size for mobile performance
                    const maxSize = 150;
                    const scale = Math.min(maxSize / img.naturalWidth, maxSize / img.naturalHeight, 1);
                    
                    canvas.width = Math.max(1, Math.floor(img.naturalWidth * scale));
                    canvas.height = Math.max(1, Math.floor(img.naturalHeight * scale));
                    
                    try {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const score = this.calculateAIScore(imageData.data, canvas.width, canvas.height);
                        resolve(score);
                    } catch (e) {
                        reject(e);
                    }
                };
                
                const isCrossOrigin = img.src && (
                    img.src.startsWith('http') && 
                    !img.src.startsWith(window.location.origin)
                );
                
                if (isCrossOrigin && !img.crossOrigin) {
                    const newImg = new Image();
                    newImg.crossOrigin = 'anonymous';
                    newImg.onload = () => {
                        Object.defineProperty(img, 'naturalWidth', { value: newImg.naturalWidth, writable: false });
                        Object.defineProperty(img, 'naturalHeight', { value: newImg.naturalHeight, writable: false });
                        tryAnalyze();
                    };
                    newImg.onerror = () => {
                        reject(new Error('CORS blocked'));
                    };
                    newImg.src = img.src;
                } else {
                    tryAnalyze();
                }
            });
        }

        calculateAIScore(data, width, height) {
            let score = 0.1;
            
            const noiseLevel = this.calculateNoiseLevel(data);
            if (noiseLevel < 20) score += 0.25;
            if (noiseLevel > 20 && noiseLevel < 40) score += 0.15;
            
            const colorVariance = this.calculateColorVariance(data);
            if (colorVariance < 50) score += 0.2;
            
            const edgeArtifacts = this.detectEdgeArtifacts(data, width, height);
            if (edgeArtifacts > 0.3) score += 0.2;
            
            const repetition = this.detectRepetitivePatterns(data, width, height);
            if (repetition > 0.4) score += 0.15;
            
            return Math.min(score, 0.95);
        }

        calculateNoiseLevel(data) {
            let totalVariance = 0;
            let samples = 0;
            
            for (let i = 0; i < data.length - 4; i += 20) { // Larger step for mobile
                const r1 = data[i];
                const g1 = data[i + 1];
                const b1 = data[i + 2];
                const r2 = data[i + 4];
                const g2 = data[i + 5];
                const b2 = data[i + 6];
                
                const diff = Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
                totalVariance += diff;
                samples++;
            }
            
            return samples > 0 ? totalVariance / samples : 0;
        }

        calculateColorVariance(data) {
            const colorCounts = {};
            let samples = 0;
            
            for (let i = 0; i < data.length; i += 16) { // Larger step for mobile
                const r = Math.floor(data[i] / 32) * 32;
                const g = Math.floor(data[i + 1] / 32) * 32;
                const b = Math.floor(data[i + 2] / 32) * 32;
                const key = `${r},${g},${b}`;
                colorCounts[key] = (colorCounts[key] || 0) + 1;
                samples++;
            }
            
            const uniqueColors = Object.keys(colorCounts).length;
            return (uniqueColors / samples) * 100;
        }

        detectEdgeArtifacts(data, width, height) {
            let artifacts = 0;
            let checks = 0;
            
            for (let y = 1; y < height - 1; y += 3) { // Larger step
                for (let x = 1; x < width - 1; x += 3) {
                    const idx = (y * width + x) * 4;
                    const left = (y * width + (x - 1)) * 4;
                    const right = (y * width + (x + 1)) * 4;
                    
                    const diff = Math.abs(data[idx] - data[left]) + Math.abs(data[idx + 1] - data[left + 1]) + Math.abs(data[idx + 2] - data[left + 2]);
                    const diff2 = Math.abs(data[idx] - data[right]) + Math.abs(data[idx + 1] - data[right + 1]) + Math.abs(data[idx + 2] - data[right + 2]);
                    
                    if (diff > 100 && diff2 > 100) artifacts++;
                    checks++;
                }
            }
            
            return checks > 0 ? artifacts / checks : 0;
        }

        detectRepetitivePatterns(data, width, height) {
            const patterns = new Set();
            let checks = 0;
            
            for (let y = 0; y < height - 10; y += 8) { // Larger step
                for (let x = 0; x < width - 10; x += 8) {
                    const idx = (y * width + x) * 4;
                    const pattern = `${data[idx]},${data[idx + 1]},${data[idx + 2]}`;
                    patterns.add(pattern);
                    checks++;
                }
            }
            
            return checks > 0 ? patterns.size / checks : 0;
        }

        showImagePercentage(img, score) {
            const percentage = Math.round(score * 100);
            
            let container = img.parentElement;
            if (!container.classList.contains('fakeless-mobile-container')) {
                container = document.createElement('div');
                container.style.cssText = 'position: relative; display: inline-block;';
                container.className = 'fakeless-mobile-container';
                img.parentNode.insertBefore(container, img);
                container.appendChild(img);
            }
            
            // Check if label already exists
            if (container.querySelector('.fakeless-mobile-label')) return;
            
            const label = document.createElement('div');
            label.className = 'fakeless-mobile-label';
            label.textContent = `${percentage}%`;
            label.style.cssText = `
                position: absolute;
                top: 4px;
                right: 4px;
                background: rgba(255, 107, 107, 0.9);
                color: white;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                z-index: 9999;
                font-family: Arial, sans-serif;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
            `;
            
            container.appendChild(label);
        }

        showNotification(message, type = 'info') {
            // Use native toast on mobile if available, or simple div
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                right: 10px;
                background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ff6b6b' : '#1890ff'};
                color: white;
                padding: 12px 16px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
                z-index: 10001;
                font-family: Arial, sans-serif;
                font-size: 14px;
                text-align: center;
                animation: slideDown 0.3s ease-out;
            `;

            notification.textContent = message;
            
            if (!document.querySelector('#fakeless-mobile-styles')) {
                const style = document.createElement('style');
                style.id = 'fakeless-mobile-styles';
                style.textContent = `
                    @keyframes slideDown {
                        from { transform: translateY(-100%); opacity: 0; }
                        to { transform: translateY(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 4000);
        }
    }

    window.geminiScannerMobile = new GeminiAIScannerMobile();
})();
