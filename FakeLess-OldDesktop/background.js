// FakeLess - Unified Background Script
// Handles API key loading and messaging between content scripts

// Load API key from .env file
async function loadEnvApiKey() {
  try {
    const url = browser.runtime.getURL('.env');
    const response = await fetch(url);

    if (!response.ok) {
      console.log('FakeLess: No .env file found, using stored API key');
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
      console.log('FakeLess: API Key loaded from .env');
    }
  } catch (error) {
    console.log('FakeLess: Using stored API key');
  }
}

// Initialize on install/startup
browser.runtime.onInstalled.addListener(loadEnvApiKey);
browser.runtime.onStartup.addListener(loadEnvApiKey);

// Message handling for all features
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Video call widget - broadcast toggle to all frames
  if (message.action === "broadcastToggle") {
    browser.tabs.query({active: true, currentWindow: true}).then(tabs => {
      tabs.forEach(tab => {
        browser.tabs.sendMessage(tab.id, {action: "toggleScan"}).catch(() => {});
      });
    });
  }
  
  // Video call widget - UI updates
  if (message.action === "updateUI") {
    browser.tabs.sendMessage(sender.tab.id, message).catch(() => {});
  }
  
  // Web scanner - manual scan trigger
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
});

// Initial load
loadEnvApiKey();
