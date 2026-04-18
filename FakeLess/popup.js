// FakeLess Popup Script
// Handles popup interactions

(function() {
    'use strict';

    // Open settings page
    document.getElementById('openSettings').addEventListener('click', function(e) {
        e.preventDefault();
        browser.runtime.openOptionsPage();
        window.close();
    });

    // Trigger manual scan
    document.getElementById('manualScan').addEventListener('click', function(e) {
        e.preventDefault();
        
        browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
            tabs.forEach(tab => {
                browser.tabs.sendMessage(tab.id, {action: "manualScan"}).catch(() => {});
            });
        });
        
        // Show feedback
        const button = document.getElementById('manualScan');
        const originalText = button.textContent;
        button.textContent = 'Skanowanie...';
        button.style.background = '#52c41a';
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    });

    // Load status indicators
    function loadStatus() {
        browser.storage.sync.get({
            geminiEnabled: true,
            enableFilter: true,
            enableAdultBlock: true
        }).then(settings => {
            updateIndicator('aiStatus', settings.geminiEnabled);
            updateIndicator('filterStatus', settings.enableFilter);
            updateIndicator('adultStatus', settings.enableAdultBlock);
        });
    }

    function updateIndicator(id, enabled) {
        const indicator = document.getElementById(id);
        if (indicator) {
            indicator.className = 'status-indicator' + (enabled ? '' : ' off');
        }
    }

    // Load status on popup open
    loadStatus();
})();
