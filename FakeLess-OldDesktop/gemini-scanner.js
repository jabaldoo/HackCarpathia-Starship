// FakeLess - Gemini AI Scanner for Web Images
// Detects AI-generated images on web pages

(function() {
    'use strict';

    class GeminiAIScanner {
        constructor() {
            this.isEnabled = true;
            this.apiKey = null;
            this.scanInterval = 10000;
            this.scanTimer = null;
            this.isScanning = false;
            this.detectedImages = new Set();
            this.useLocalDetection = true;
            
            console.log('FakeLess: AI Scanner initialized');
            this.loadSettings();
        }

        async loadSettings() {
            try {
                // Try sync storage first, then local (for .env loaded keys)
                let settings = await browser.storage.sync.get({
                    geminiEnabled: true,
                    geminiApiKey: '',
                    geminiScanInterval: 10000,
                    geminiShowWarnings: true,
                    useLocalDetection: true
                });
                
                // Also check local storage for API key (from .env)
                const localData = await browser.storage.local.get('geminiApiKey');
                if (localData.geminiApiKey && !settings.geminiApiKey) {
                    settings.geminiApiKey = localData.geminiApiKey;
                    // Sync it back to sync storage
                    await browser.storage.sync.set({ geminiApiKey: localData.geminiApiKey });
                }
                
                this.isEnabled = settings.geminiEnabled;
                this.apiKey = settings.geminiApiKey;
                this.scanInterval = settings.geminiScanInterval;
                this.useLocalDetection = settings.useLocalDetection !== false;
                
                if (this.isEnabled) {
                    if (this.apiKey) {
                        this.startAutomaticScanning();
                    } else if (this.useLocalDetection) {
                        this.startLocalScanning();
                    }
                }
            } catch (error) {
                console.error('FakeLess: Error loading settings:', error);
            }
        }

        startAutomaticScanning() {
            setTimeout(() => {
                this.performScreenAnalysis();
            }, 3000);
            
            this.scanTimer = setInterval(() => {
                this.performScreenAnalysis();
            }, this.scanInterval);
        }

        startLocalScanning() {
            setTimeout(() => {
                this.performLocalAnalysis();
            }, 3000);
            
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

        async performScreenAnalysis() {
            if (this.isScanning || !this.isEnabled || !this.apiKey) {
                return;
            }

            this.isScanning = true;
            console.log('FakeLess: Starting AI screen analysis...');

            try {
                const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                const activeTab = tabs[0];
                
                if (!activeTab) {
                    console.error('No active tab found');
                    return;
                }
                
                const dataUrl = await browser.tabs.captureVisibleTab(activeTab.id, { format: 'png' });
                const analysis = await this.analyzeWithGemini(dataUrl);
                
                if (analysis && analysis.containsAIImages) {
                    this.markPageAsSuspicious(analysis);
                }
                
            } catch (error) {
                console.error('Error during screen analysis:', error);
            } finally {
                this.isScanning = false;
            }
        }

        async analyzeWithGemini(imageDataUrl) {
            try {
                const base64Image = imageDataUrl.split(',')[1];
                
                const requestBody = {
                    contents: [{
                        parts: [{
                            text: `Analyze this screenshot and identify if there are any AI-generated, deepfake, or digitally manipulated images. Look for:
                            1. Unnatural facial features or expressions
                            2. Inconsistent lighting or shadows
                            3. Blurry or distorted areas around faces
                            4. Unusual skin textures
                            5. Background inconsistencies
                            6. Digital artifacts or glitches
                            
                            Respond in JSON format:
                            {
                                "containsAIImages": true/false,
                                "confidence": 0.0-1.0,
                                "suspiciousRegions": ["description of areas"],
                                "details": "specific observations"
                            }`
                        }, {
                            inline_data: {
                                mime_type: "image/png",
                                data: base64Image
                            }
                        }]
                    }]
                };

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(requestBody)
                });

                if (!response.ok) {
                    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
                }

                const result = await response.json();
                
                if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                    const aiResponse = result.candidates[0].content.parts[0].text;
                    
                    try {
                        const analysis = JSON.parse(aiResponse);
                        return analysis;
                    } catch (parseError) {
                        return {
                            containsAIImages: aiResponse.toLowerCase().includes('ai') || aiResponse.toLowerCase().includes('fake'),
                            confidence: 0.7,
                            suspiciousRegions: ['Multiple areas detected'],
                            details: aiResponse
                        };
                    }
                }

                return null;
                
            } catch (error) {
                console.error('Error calling Gemini API:', error);
                throw error;
            }
        }

        markPageAsSuspicious(analysis) {
            try {
                this.removeExistingWarnings();

                const warning = document.createElement('div');
                warning.id = 'gemini-ai-warning';
                warning.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                    color: white;
                    padding: 15px;
                    text-align: center;
                    z-index: 10000;
                    font-family: Arial, sans-serif;
                    font-size: 14px;
                    font-weight: bold;
                    box-shadow: 0 4px 20px rgba(238, 90, 36, 0.4);
                    border-bottom: 3px solid #c44569;
                `;

                warning.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; gap: 15px;">
                        <span style="font-size: 20px;">AI DETECTED</span>
                        <span>Confidence: ${Math.round(analysis.confidence * 100)}%</span>
                        <span style="font-size: 12px; opacity: 0.9;">${analysis.details}</span>
                        <button onclick="this.parentElement.parentElement.remove()" style="
                            background: rgba(255,255,255,0.2);
                            border: 1px solid white;
                            color: white;
                            padding: 5px 10px;
                            border-radius: 3px;
                            cursor: pointer;
                            font-size: 12px;
                        ">Dismiss</button>
                    </div>
                `;

                document.body.appendChild(warning);
                this.highlightSuspiciousImages(analysis);
                this.showNotification(`AI images detected with ${Math.round(analysis.confidence * 100)}% confidence`, 'warning');

            } catch (error) {
                console.error('Error marking page as suspicious:', error);
            }
        }

        highlightSuspiciousImages(analysis) {
            const images = document.querySelectorAll('img');
            
            images.forEach(img => {
                if (!this.detectedImages.has(img.src)) {
                    const overlay = document.createElement('div');
                    overlay.style.cssText = `
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(238, 90, 36, 0.2);
                        border: 3px solid #ff6b6b;
                        pointer-events: none;
                        z-index: 9999;
                        box-sizing: border-box;
                        animation: pulse 2s infinite;
                    `;

                    const label = document.createElement('div');
                    label.textContent = 'AI Detected';
                    label.style.cssText = `
                        position: absolute;
                        top: 5px;
                        left: 5px;
                        background: #ff6b6b;
                        color: white;
                        padding: 3px 8px;
                        border-radius: 4px;
                        font-size: 11px;
                        font-weight: bold;
                        z-index: 10000;
                        font-family: Arial, sans-serif;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    `;

                    if (!document.querySelector('#gemini-pulse-style')) {
                        const style = document.createElement('style');
                        style.id = 'gemini-pulse-style';
                        style.textContent = `
                            @keyframes pulse {
                                0% { opacity: 0.6; }
                                50% { opacity: 1; }
                                100% { opacity: 0.6; }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    if (!img.parentElement.classList.contains('gemini-container')) {
                        const container = document.createElement('div');
                        container.style.cssText = `
                            position: relative;
                            display: inline-block;
                            line-height: 0;
                        `;
                        container.classList.add('gemini-container');
                        
                        img.parentNode.insertBefore(container, img);
                        container.appendChild(img);
                        container.appendChild(overlay);
                        container.appendChild(label);
                        
                        this.detectedImages.add(img.src);
                    }
                }
            });
        }

        removeExistingWarnings() {
            const existingWarning = document.getElementById('gemini-ai-warning');
            if (existingWarning) {
                existingWarning.remove();
            }

            const existingContainers = document.querySelectorAll('.gemini-container');
            existingContainers.forEach(container => {
                const img = container.querySelector('img');
                if (img && img.parentNode) {
                    img.parentNode.insertBefore(img, container);
                    container.remove();
                }
            });
        }

        showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#dc3545' : type === 'warning' ? '#ff6b6b' : '#007cba'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                z-index: 10001;
                font-family: Arial, sans-serif;
                font-size: 14px;
                max-width: 300px;
                animation: slideIn 0.3s ease-out;
            `;

            notification.textContent = message;
            
            if (!document.querySelector('#gemini-slide-style')) {
                const style = document.createElement('style');
                style.id = 'gemini-slide-style';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `;
                document.head.appendChild(style);
            }
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 5000);
        }

        async updateSettings(settings) {
            this.isEnabled = settings.geminiEnabled !== false;
            this.apiKey = settings.geminiApiKey || '';
            this.scanInterval = settings.geminiScanInterval || 10000;
            this.useLocalDetection = settings.useLocalDetection !== false;
            
            this.stopScanning();
            if (this.isEnabled) {
                if (this.apiKey) {
                    this.startAutomaticScanning();
                    this.showNotification('FakeLess AI scanner activated', 'info');
                } else if (this.useLocalDetection) {
                    this.startLocalScanning();
                    this.showNotification('Local AI detection activated', 'info');
                }
            }
        }

        async manualScan() {
            if (this.apiKey) {
                this.showNotification('Starting AI scan...', 'info');
                await this.performScreenAnalysis();
            } else {
                this.showNotification('Starting local detection...', 'info');
                await this.performLocalAnalysis();
            }
        }

        async performLocalAnalysis() {
            if (this.isScanning || !this.isEnabled) return;
            
            this.isScanning = true;
            console.log('FakeLess: Starting local AI analysis...');
            
            const images = document.querySelectorAll('img');
            let aiImageCount = 0;
            let analyzedCount = 0;
            
            for (const img of images) {
                if (img.width < 100 || img.height < 100) continue;
                if (img.dataset.aiAnalyzed) continue;
                if (!img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) continue;
                
                try {
                    const score = await this.analyzeImageLocally(img);
                    
                    if (score > 0.3) {
                        aiImageCount++;
                        this.showImagePercentage(img, score);
                    }
                    
                    img.dataset.aiAnalyzed = 'true';
                    analyzedCount++;
                    
                } catch (e) {
                    if (e.message && e.message.includes('CORS')) {
                        const fallbackScore = this.analyzeImageByURL(img);
                        if (fallbackScore > 0.4) {
                            aiImageCount++;
                            this.showImagePercentage(img, fallbackScore);
                        }
                        img.dataset.aiAnalyzed = 'true';
                        analyzedCount++;
                    }
                }
            }
            
            console.log(`Analysis complete: ${analyzedCount} analyzed, ${aiImageCount} AI detected`);
            
            if (aiImageCount > 0) {
                this.showNotification(`Detected ${aiImageCount} potentially AI-generated images`, 'warning');
            }
            
            this.isScanning = false;
        }

        analyzeImageByURL(img) {
            const src = img.src || '';
            let score = 0.1;
            
            const aiPatterns = [
                /openai/i, /dalle/i, /midjourney/i, /stable-diffusion/i,
                /craiyon/i, /dreamstudio/i, /nightcafe/i, /artbreeder/i,
                /thispersondoesnotexist/i, /generated/i, /ai-art/i
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
                    reject(new Error('Image has invalid dimensions'));
                    return;
                }
                
                const tryAnalyze = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    const maxSize = 200;
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
            
            for (let i = 0; i < data.length - 4; i += 16) {
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
            
            for (let i = 0; i < data.length; i += 12) {
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
            
            for (let y = 1; y < height - 1; y += 2) {
                for (let x = 1; x < width - 1; x += 2) {
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
            
            for (let y = 0; y < height - 10; y += 5) {
                for (let x = 0; x < width - 10; x += 5) {
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
            if (!container.classList.contains('gemini-container')) {
                container = document.createElement('div');
                container.style.cssText = 'position: relative; display: inline-block;';
                container.className = 'gemini-container';
                img.parentNode.insertBefore(container, img);
                container.appendChild(img);
            }
            
            const label = document.createElement('div');
            label.className = 'ai-percentage-label';
            label.textContent = `${percentage}% AI`;
            label.style.cssText = `
                position: absolute;
                top: 5px;
                right: 5px;
                background: linear-gradient(135deg, #ff6b6b, #ee5a24);
                color: white;
                padding: 6px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: bold;
                z-index: 10000;
                font-family: Arial, sans-serif;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                border: 2px solid rgba(255,255,255,0.3);
            `;
            
            if (percentage > 50) {
                const overlay = document.createElement('div');
                overlay.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(255, 107, 107, 0.1);
                    border: 3px solid #ff6b6b;
                    pointer-events: none;
                    z-index: 9999;
                    box-sizing: border-box;
                `;
                container.appendChild(overlay);
            }
            
            container.appendChild(label);
        }
    }

    window.geminiScanner = new GeminiAIScanner();
})();
