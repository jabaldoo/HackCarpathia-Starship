(function() {
    'use strict';

    class GeminiAIScanner {
        constructor() {
            this.isEnabled = true;
            this.apiKey = null;
            this.scanInterval = 10000; // 10 seconds
            this.scanTimer = null;
            this.isScanning = false;
            this.detectedImages = new Set();
            
            console.log('Gemini AI Scanner initialized');
            this.loadSettings();
        }

        async loadSettings() {
            try {
                const settings = await browser.storage.sync.get({
                    geminiEnabled: true,
                    geminiApiKey: '',
                    geminiScanInterval: 10000,
                    geminiShowWarnings: true
                });
                
                this.isEnabled = settings.geminiEnabled;
                this.apiKey = settings.geminiApiKey;
                this.scanInterval = settings.geminiScanInterval;
                
                if (this.isEnabled && this.apiKey) {
                    this.startAutomaticScanning();
                }
            } catch (error) {
                console.error('Error loading Gemini settings:', error);
            }
        }

        startAutomaticScanning() {
            // Initial scan after page loads
            setTimeout(() => {
                this.performScreenAnalysis();
            }, 3000);
            
            // Set up periodic scanning
            this.scanTimer = setInterval(() => {
                this.performScreenAnalysis();
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
            console.log('Starting Gemini AI screen analysis...');

            try {
                // Capture visible tab - use proper Firefox API
                const tabs = await browser.tabs.query({ active: true, currentWindow: true });
                const activeTab = tabs[0];
                
                if (!activeTab) {
                    console.error('No active tab found');
                    return;
                }
                
                // Capture screenshot - use proper Firefox API
                const dataUrl = await browser.tabs.captureVisibleTab(activeTab.id, { format: 'png' });
                
                // Analyze with Gemini AI
                const analysis = await this.analyzeWithGemini(dataUrl);
                
                // Process results
                if (analysis && analysis.containsAIImages) {
                    this.markPageAsSuspicious(analysis);
                }
                
            } catch (error) {
                console.error('Error during screen analysis:', error);
                this.showNotification('Gemini AI analysis failed. Check API key.', 'error');
            } finally {
                this.isScanning = false;
            }
        }

        async analyzeWithGemini(imageDataUrl) {
            try {
                // Convert data URL to base64
                const base64Image = imageDataUrl.split(',')[1];
                
                // Prepare the request for Gemini API
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

                // Make API request
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
                
                // Extract the AI response
                if (result.candidates && result.candidates[0] && result.candidates[0].content) {
                    const aiResponse = result.candidates[0].content.parts[0].text;
                    
                    // Try to parse JSON response
                    try {
                        const analysis = JSON.parse(aiResponse);
                        return analysis;
                    } catch (parseError) {
                        // If JSON parsing fails, create a basic response
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
                // Remove existing warnings
                this.removeExistingWarnings();

                // Create warning banner
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

                // Highlight suspicious images
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
                    // Create overlay
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

                    // Create label
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

                    // Add pulse animation
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

                    // Wrap image
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
            
            // Add slide animation
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
            
            this.stopScanning();
            if (this.isEnabled && this.apiKey) {
                this.startAutomaticScanning();
                this.showNotification('Gemini AI scanner activated', 'info');
            } else if (!this.apiKey) {
                this.showNotification('Gemini API key required', 'error');
            }
        }
        }
        }

        // Manual scan trigger
        async manualScan() {
            this.showNotification('Starting manual Gemini AI scan...', 'info');
            await this.performScreenAnalysis();
        }
    }

    // Create global instance
    window.geminiScanner = new GeminiAIScanner();
