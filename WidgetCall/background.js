async function loadEnv() {
  try {
    const response = await fetch(chrome.runtime.getURL('.env'));
    const text = await response.text();
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

    await chrome.storage.local.set({ allEnvKeys: env });
  } catch (error) {
    console.error('Failed to load .env file:', error);
  }
}

// Run on install and startup
chrome.runtime.onInstalled.addListener(loadEnv);
chrome.runtime.onStartup.addListener(loadEnv);

// Listen for messages from content script to reload keys
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "reloadKeys") {
    loadEnv().then(() => sendResponse({status: "done"}));
    return true;
  }
});

loadEnv();
