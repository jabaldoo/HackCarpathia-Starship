// FakeLess Mobile - Options Script
// Mobile-optimized settings management

(function() {
    'use strict';

    const defaultSettings = {
        geminiApiKey: '',
        geminiEnabled: true,
        geminiScanInterval: 15000,
        enableAdultBlock: true,
        enableFilter: true,
        replacementChar: '#'
    };

    function loadSettings() {
        browser.storage.sync.get(defaultSettings, function(items) {
            document.getElementById('geminiApiKey').value = items.geminiApiKey || '';
            document.getElementById('geminiEnabled').checked = items.geminiEnabled;
            document.getElementById('geminiScanInterval').value = items.geminiScanInterval;
            document.getElementById('enableAdultBlock').checked = items.enableAdultBlock;
            document.getElementById('enableFilter').checked = items.enableFilter;
            document.getElementById('replacementChar').value = items.replacementChar;
        });

        // Load API key from local storage (from .env)
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
            geminiApiKey: document.getElementById('geminiApiKey').value.trim(),
            geminiEnabled: document.getElementById('geminiEnabled').checked,
            geminiScanInterval: parseInt(document.getElementById('geminiScanInterval').value),
            enableAdultBlock: document.getElementById('enableAdultBlock').checked,
            enableFilter: document.getElementById('enableFilter').checked,
            replacementChar: document.getElementById('replacementChar').value.charAt(0) || '#'
        };

        browser.storage.sync.set(settings, function() {
            if (browser.runtime.lastError) {
                showStatus('Błąd: ' + browser.runtime.lastError.message, 'error');
            } else {
                // Also save to local for .env compatibility
                if (settings.geminiApiKey) {
                    browser.storage.local.set({ geminiApiKey: settings.geminiApiKey });
                }
                
                showStatus('Ustawienia zapisane!', 'success');
                
                // Notify content scripts
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
            showStatus('Przywrócono domyślne', 'success');
        });
    }

    function showStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = 'status ' + type;
        statusDiv.classList.add('show');

        setTimeout(() => {
            statusDiv.classList.remove('show');
        }, 3000);
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', loadSettings);
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);

    // Limit replacement char to 1 character
    document.getElementById('replacementChar').addEventListener('input', function(e) {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.charAt(0);
        }
    });
})();
