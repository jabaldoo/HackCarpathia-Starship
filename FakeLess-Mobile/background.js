// FakeLess Mobile - Background Script
// Mobile-optimized background handling

// Load API key from .env file
async function loadEnvApiKey() {
  try {
    const url = browser.runtime.getURL('.env');
    const response = await fetch(url);

    if (!response.ok) {
      console.log('FakeLess Mobile: No .env file found');
      return;
    }

    const text = await response.text();
    if (!text) return;

    const env = {};
    text.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
      }
    });

    if (env.GOOGLE_API_KEY) {
      await browser.storage.local.set({ geminiApiKey: env.GOOGLE_API_KEY });
      await browser.storage.sync.set({ geminiApiKey: env.GOOGLE_API_KEY });
      console.log('FakeLess Mobile: API Key loaded from .env');
    }
  } catch (error) {
    console.log('FakeLess Mobile: Using stored API key');
  }
}

// Initialize on install/startup
browser.runtime.onInstalled.addListener(loadEnvApiKey);
browser.runtime.onStartup.addListener(loadEnvApiKey);

// Message handling
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Manual scan trigger
  if (message.action === "manualScan") {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, {action: "manualScan"}).catch(() => {});
      });
    });
  }
  
  // Settings update
  if (message.action === "updateSettings") {
    browser.tabs.query({}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, {
          action: "updateSettings",
          settings: message.settings
        }).catch(() => {});
      });
    });
  }
  
  // Get current tab info for mobile
  if (message.action === "getTabInfo") {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      if (sendResponse) {
        sendResponse({
          url: tabs[0]?.url || '',
          title: tabs[0]?.title || ''
        });
      }
    });
    return true; // Keep channel open for async
  }
});

// Handle browser action click (mobile-friendly)
browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({
    url: browser.runtime.getURL('options.html')
  });
});

// Initial load
loadEnvApiKey();
