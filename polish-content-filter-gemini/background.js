(function() {
    'use strict';

    // Handle addon icon click for manual scan
    browser.browserAction.onClicked.addListener((tab) => {
        // Send message to content script to trigger manual Gemini scan
        browser.tabs.sendMessage(tab.id, {
            action: 'manualScan'
        }).catch(error => {
            console.log('Error sending manual scan message:', error);
        });
    });

    // Handle installation
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            console.log('Polish Content Filter & Gemini AI Scanner installed');
            // Open options page to get API key
            browser.runtime.openOptionsPage();
        } else if (details.reason === 'update') {
            console.log('Polish Content Filter & Gemini AI Scanner updated');
        }
    });

})();
