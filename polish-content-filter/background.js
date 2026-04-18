(function() {
    'use strict';

    // Handle installation
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install') {
            console.log('Polish Content Filter & Deepfake Scanner installed');
        } else if (details.reason === 'update') {
            console.log('Polish Content Filter & Deepfake Scanner updated');
        }
    });

})();
