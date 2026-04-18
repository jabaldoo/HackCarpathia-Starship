// Function to safely load environment variables
async function loadEnv() {
  try {
    const url = chrome.runtime.getURL('.env');
    const response = await fetch(url);

    // Check if response is ok to avoid stream closure issues
    if (!response.ok) {
        console.warn('Environment file not accessible yet');
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
      await chrome.storage.local.set({ geminiApiKey: env.GOOGLE_API_KEY });
      console.log('Gemini API Key loaded from .env');
    }
  } catch (error) {
    // Catch the NS_BASE_STREAM_CLOSED error gracefully
    if (error.message.includes('NS_BASE_STREAM_CLOSED') || error.code === 0x80470002) {
      console.log('Stream temporarily closed, retrying in 1s...');
      setTimeout(loadEnv, 1000);
    } else {
      console.error('Safe Env Loader Error:', error);
    }
  }
}

// Robust triggers for background script
chrome.runtime.onInstalled.addListener(loadEnv);
chrome.runtime.onStartup.addListener(loadEnv);

// Action listener to handle UI updates from different frames
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateUI") {
    chrome.tabs.sendMessage(sender.tab.id, message).catch(() => {});
  }
  if (message.action === "broadcastToggle") {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {action: "toggleScan"}).catch(() => {});
      });
    });
  }
});

// Final fallback to ensure keys load even if browser events fail
loadEnv();
