// FakeLess Unified Options Script
// Manages settings for all features: Web AI scanner, Video call protection, Content filtering

(function() {
    'use strict';

    const defaultSettings = {
        // API Key (shared across all features)
        geminiApiKey: '',
        
        // Web AI Scanner settings
        geminiEnabled: true,
        geminiScanInterval: 60000,
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
        // Load API key from local storage only (user's local storage)
        browser.storage.local.get('geminiApiKey', function(items) {
            console.log('FakeLess: Loaded API key from local storage:', items);
            
            const apiKeyField = document.getElementById('geminiApiKey');
            if (apiKeyField) {
                apiKeyField.value = items.geminiApiKey || '';
                console.log('FakeLess: API key field value set to:', apiKeyField.value);
            }
        });
        
        browser.storage.sync.get(defaultSettings, function(items) {
            console.log('FakeLess: Loaded other settings from storage:', items);
            
            // Web AI Scanner
            const geminiEnabled = document.getElementById('geminiEnabled');
            if (geminiEnabled) geminiEnabled.checked = items.geminiEnabled;
            
            const geminiScanInterval = document.getElementById('geminiScanInterval');
            if (geminiScanInterval) geminiScanInterval.value = items.geminiScanInterval;
            
            const geminiShowWarnings = document.getElementById('geminiShowWarnings');
            if (geminiShowWarnings) geminiShowWarnings.checked = items.geminiShowWarnings;
            
            const useLocalDetection = document.getElementById('useLocalDetection');
            if (useLocalDetection) useLocalDetection.checked = items.useLocalDetection !== false;
            
            // Video Call
            const videoCallProtection = document.getElementById('videoCallProtection');
            if (videoCallProtection) videoCallProtection.checked = items.videoCallProtection !== false;
            
            // Content Filter
            const enableFilter = document.getElementById('enableFilter');
            if (enableFilter) enableFilter.checked = items.enableFilter;
            
            const enableAdultBlock = document.getElementById('enableAdultBlock');
            if (enableAdultBlock) enableAdultBlock.checked = items.enableAdultBlock !== false;
            
            const replacementChar = document.getElementById('replacementChar');
            if (replacementChar) replacementChar.value = items.replacementChar;
            
            const filterStrength = document.getElementById('filterStrength');
            if (filterStrength) filterStrength.value = items.filterStrength;
            
            const excludeSocialMedia = document.getElementById('excludeSocialMedia');
            if (excludeSocialMedia) excludeSocialMedia.checked = items.excludeSocialMedia;
            
            const excludeForums = document.getElementById('excludeForums');
            if (excludeForums) excludeForums.checked = items.excludeForums;
            
            const excludeNews = document.getElementById('excludeNews');
            if (excludeNews) excludeNews.checked = items.excludeNews;
        });

        browser.storage.local.get(['stats'], function(items) {
            if (items.stats) {
                stats = items.stats;
                updateStats();
            }
        });
    }

    function saveSettings() {
        const settings = {
            geminiEnabled: document.getElementById('geminiEnabled')?.checked || false,
            geminiScanInterval: parseInt(document.getElementById('geminiScanInterval')?.value) || 60000,
            geminiShowWarnings: document.getElementById('geminiShowWarnings')?.checked || false,
            useLocalDetection: document.getElementById('useLocalDetection')?.checked || false,
            videoCallProtection: document.getElementById('videoCallProtection')?.checked || false,
            enableFilter: document.getElementById('enableFilter')?.checked || false,
            enableAdultBlock: document.getElementById('enableAdultBlock')?.checked || false,
            replacementChar: document.getElementById('replacementChar')?.value || '#',
            filterStrength: document.getElementById('filterStrength')?.value || 'moderate',
            excludeSocialMedia: document.getElementById('excludeSocialMedia')?.checked || false,
            excludeForums: document.getElementById('excludeForums')?.checked || false,
            excludeNews: document.getElementById('excludeNews')?.checked || false
        };

        const apiKey = document.getElementById('geminiApiKey')?.value || '';

        // Save API key to local storage only (user's local storage)
        browser.storage.local.set({ geminiApiKey: apiKey }, function() {
            console.log('FakeLess: API Key saved to local storage:', apiKey);
        });

        // Save other settings to sync storage
        browser.storage.sync.set(settings, function() {
            if (browser.runtime.lastError) {
                showStatus('Błąd zapisu: ' + browser.runtime.lastError.message, 'error');
            } else {
                console.log('FakeLess: Settings saved successfully');
                showStatus('Ustawienia zapisane! Klucz: ' + apiKey.substring(0, 10) + '...', 'success');
                
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

    const saveBtn = document.getElementById('saveSettings');
    if (saveBtn) saveBtn.addEventListener('click', saveSettings);
    
    const resetBtn = document.getElementById('resetSettings');
    if (resetBtn) resetBtn.addEventListener('click', resetSettings);

    const replacementCharInput = document.getElementById('replacementChar');
    if (replacementCharInput) {
        replacementCharInput.addEventListener('input', function(e) {
            if (e.target.value.length > 1) {
                e.target.value = e.target.value.charAt(1);
            }
        });
    }

    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'updateStats') {
            stats = message.stats;
            browser.storage.local.set({ stats: stats });
            updateStats();
        }
    });
})();
