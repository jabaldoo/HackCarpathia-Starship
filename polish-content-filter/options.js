(function() {
    'use strict';

    // Default settings
    const defaultSettings = {
        enableFilter: true,
        replaceWithHash: true,
        replacementChar: '#',
        filterStrength: 'moderate',
        excludeSocialMedia: true,
        excludeForums: true,
        excludeNews: true,
        deepfakeEnabled: true,
        deepfakeThreshold: 0.7,
        deepfakeScanInterval: 5000,
        deepfakeShowWarnings: true
    };

    // Statistics
    let stats = {
        totalWords: 0,
        filteredCount: 0,
        pagesFiltered: 0
    };

    // Load settings from storage
    function loadSettings() {
        browser.storage.sync.get(defaultSettings, function(items) {
            document.getElementById('enableFilter').checked = items.enableFilter;
            document.getElementById('replaceWithHash').checked = items.replaceWithHash;
            document.getElementById('replacementChar').value = items.replacementChar;
            document.getElementById('filterStrength').value = items.filterStrength;
            document.getElementById('excludeSocialMedia').checked = items.excludeSocialMedia;
            document.getElementById('excludeForums').checked = items.excludeForums;
            document.getElementById('excludeNews').checked = items.excludeNews;
            document.getElementById('deepfakeEnabled').checked = items.deepfakeEnabled;
            document.getElementById('deepfakeThreshold').value = items.deepfakeThreshold;
            document.getElementById('deepfakeScanInterval').value = items.deepfakeScanInterval;
            document.getElementById('deepfakeShowWarnings').checked = items.deepfakeShowWarnings;
        });

        // Load statistics
        browser.storage.local.get(['stats'], function(items) {
            if (items.stats) {
                stats = items.stats;
                updateStats();
            } else {
                // Count words in the content script
                countWordsInDictionary();
            }
        });
    }

    // Save settings to storage
    function saveSettings() {
        const settings = {
            enableFilter: document.getElementById('enableFilter').checked,
            replaceWithHash: document.getElementById('replaceWithHash').checked,
            replacementChar: document.getElementById('replacementChar').value,
            filterStrength: document.getElementById('filterStrength').value,
            excludeSocialMedia: document.getElementById('excludeSocialMedia').checked,
            excludeForums: document.getElementById('excludeForums').checked,
            excludeNews: document.getElementById('excludeNews').checked,
            deepfakeEnabled: document.getElementById('deepfakeEnabled').checked,
            deepfakeThreshold: parseFloat(document.getElementById('deepfakeThreshold').value),
            deepfakeScanInterval: parseInt(document.getElementById('deepfakeScanInterval').value),
            deepfakeShowWarnings: document.getElementById('deepfakeShowWarnings').checked
        };

        browser.storage.sync.set(settings, function() {
            showStatus('Ustawienia zostay zapisane!', 'success');
            
            // Notify content scripts about the changes
            browser.tabs.query({}, function(tabs) {
                tabs.forEach(tab => {
                    browser.tabs.sendMessage(tab.id, {
                        action: 'updateSettings',
                        settings: settings
                    }).catch(() => {
                        // Ignore errors for tabs that don't have content script
                    });
                });
            });
        });
    }

    // Reset settings to defaults
    function resetSettings() {
        browser.storage.sync.set(defaultSettings, function() {
            loadSettings();
            showStatus('Ustawienia zostaly przywrcone do domylnych!', 'success');
        });
    }

    // Show status message
    function showStatus(message, type) {
        const statusDiv = document.getElementById('status');
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Update statistics display
    function updateStats() {
        document.getElementById('totalWords').innerHTML = `W bazie danych: <strong>${stats.totalWords}</strong> sw`;
        document.getElementById('filteredCount').innerHTML = `Zfiltrowanych w tej sesji: <strong>${stats.filteredCount}</strong>`;
        document.getElementById('pagesFiltered').innerHTML = `Przetworzonych stron: <strong>${stats.pagesFiltered}</strong>`;
    }

    // Count words in dictionary (simplified - in real implementation would get from content script)
    function countWordsInDictionary() {
        // This is a simplified count - in a real implementation, 
        // you'd get this from the content script
        const wordCount = 300; // Approximate count from content.js
        stats.totalWords = wordCount;
        browser.storage.local.set({ stats: stats });
        updateStats();
    }

    // Test the filter with sample text
    function testFilter() {
        const sampleText = 'To jest przykadowy tekst z wulgaryzmami: kurwa, jebac, debil, idiota.';
        const replacementChar = document.getElementById('replacementChar').value || '#';
        
        // Simple test implementation
        const offensiveWords = ['kurwa', 'jebac', 'debil', 'idiota'];
        let filteredText = sampleText;
        
        offensiveWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            filteredText = filteredText.replace(regex, (match) => {
                return replacementChar.repeat(match.length);
            });
        });

        showStatus(`Test: "${filteredText}"`, 'success');
    }

    // Event listeners
    document.addEventListener('DOMContentLoaded', loadSettings);

    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    document.getElementById('testFilter').addEventListener('click', testFilter);

    // Handle replacement character input
    document.getElementById('replacementChar').addEventListener('input', function(e) {
        if (e.target.value.length > 1) {
            e.target.value = e.target.value.charAt(0);
        }
    });

    // Handle filter strength change
    document.getElementById('filterStrength').addEventListener('change', function() {
        const strength = this.value;
        let message = '';
        
        switch(strength) {
            case 'strict':
                message = 'Wczono tryb strict - filtrowanie wszystkich wulgaryzmów i obraliwych sw';
                break;
            case 'moderate':
                message = 'Wczono tryb umiarkowany - filtrowanie tylko wulgaryzmów';
                break;
            case 'light':
                message = 'Wczono tryb light - filtrowanie tylko najwikszych wulgaryzmów';
                break;
        }
        
        showStatus(message, 'success');
    });

    // Listen for messages from content scripts
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === 'updateStats') {
            stats = message.stats;
            browser.storage.local.set({ stats: stats });
            updateStats();
        }
    });

})();
