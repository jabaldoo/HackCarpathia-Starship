// FakeLess Unified Options Script
// Manages settings for all features: Web AI scanner, Video call protection, Content filtering

(function() {
    'use strict';

    const defaultSettings = {
        // API Key (shared across all features)
        geminiApiKey: '',
        
        // Web AI Scanner settings
        geminiEnabled: true,
        geminiScanInterval: 10000,
        geminiShowWarnings: true,
        useLocalDetection: true,
        
        // Video Call Protection
        videoCallProtection: true,
        
        // Content Filter settings
        enableFilter: true,
        enableAdultBlock: true,
        replacementChar: '#',
        filterStrength: 'moderate',
        excludeSocialMedia: true,
        excludeForums: true,
        excludeNews: true
    };

    let stats = {
        totalWords: 300,
        filteredCount: 0,
        pagesFiltered: 0
    };

    function loadSettings() {
        browser.storage.sync.get(defaultSettings, function(items) {
            // API Key
            document.getElementById('geminiApiKey').value = items.geminiApiKey || '';
            
            // Web AI Scanner
            document.getElementById('geminiEnabled').checked = items.geminiEnabled;
            document.getElementById('geminiScanInterval').value = items.geminiScanInterval;
            document.getElementById('geminiShowWarnings').checked = items.geminiShowWarnings;
            document.getElementById('useLocalDetection').checked = items.useLocalDetection !== false;
            
            // Video Call
            document.getElementById('videoCallProtection').checked = items.videoCallProtection !== false;
            
            // Content Filter
            document.getElementById('enableFilter').checked = items.enableFilter;
            document.getElementById('enableAdultBlock').checked = items.enableAdultBlock !== false;
            document.getElementById('replacementChar').value = items.replacementChar;
            document.getElementById('filterStrength').value = items.filterStrength;
            document.getElementById('excludeSocialMedia').checked = items.excludeSocialMedia;
            document.getElementById('excludeForums').checked = items.excludeForums;
            document.getElementById('excludeNews').checked = items.excludeNews;
        });

        browser.storage.local.get(['stats'], function(items) {
            if (items.stats) {
                stats = items.stats;
                updateStats();
            }
        });
        
        // Also check local storage for API key from .env
        browser.storage.local.get(['geminiApiKey'], function(localItems) {
            if (localItems.geminiApiKey) {
                const apiKeyField = document.getElementById('geminiApiKey');
                if (apiKeyField && !apiKeyField.value) {
                    apiKeyField.value = localItems.geminiApiKey;
                }
            }
        });
    }

    function saveSettings() {
        const settings = {
            geminiApiKey: document.getElementById('geminiApiKey').value,
            geminiEnabled: document.getElementById('geminiEnabled').checked,
            geminiScanInterval: parseInt(document.getElementById('geminiScanInterval').value),
            geminiShowWarnings: document.getElementById('geminiShowWarnings').checked,
            useLocalDetection: document.getElementById('useLocalDetection').checked,
            videoCallProtection: document.getElementById('videoCallProtection').checked,
            enableFilter: document.getElementById('enableFilter').checked,
            enableAdultBlock: document.getElementById('enableAdultBlock').checked,
            replacementChar: document.getElementById('replacementChar').value,
            filterStrength: document.getElementById('filterStrength').value,
            excludeSocialMedia: document.getElementById('excludeSocialMedia').checked,
            excludeForums: document.getElementById('excludeForums').checked,
            excludeNews: document.getElementById('excludeNews').checked
        };

        // Save to sync storage
        browser.storage.sync.set(settings, function() {
            if (browser.runtime.lastError) {
                showStatus('Błąd zapisu: ' + browser.runtime.lastError.message, 'error');
            } else {
                showStatus('Ustawienia zapisane pomyślnie!', 'success');
                
                // Also save API key to local storage for .env compatibility
                if (settings.geminiApiKey) {
                    browser.storage.local.set({ geminiApiKey: settings.geminiApiKey });
                }
                
                // Notify all content scripts
                browser.tabs.query({}, function(tabs) {
                    tabs.forEach(tab => {
                        browser.tabs.sendMessage(tab.id, {
                            action: 'updateSettings',
                            settings: settings
                        }).catch(() => {});
                    });
                });
            }
        });
    }

    function resetSettings() {
        browser.storage.sync.set(defaultSettings, function() {
            loadSettings();
            showStatus('Przywrócono ustawienia domyślne!', 'success');
        });
    }

    function showStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    function updateStats() {
        document.getElementById('totalWords').innerHTML = `Słów w bazie: <strong>${stats.totalWords}</strong>`;
        document.getElementById('filteredCount').innerHTML = `Zablokowanych treści: <strong>${stats.filteredCount}</strong>`;
        document.getElementById('pagesFiltered').innerHTML = `Przetworzonych stron: <strong>${stats.pagesFiltered}</strong>`;
    }

    document.addEventListener('DOMContentLoaded', loadSettings);

    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);

    document.getElementById('replacementChar').addEventListener('input', function(e) {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.charAt(0);
        }
    });

    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'updateStats') {
            stats = message.stats;
            browser.storage.local.set({ stats: stats });
            updateStats();
        }
    });
})();
