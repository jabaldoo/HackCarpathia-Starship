document.addEventListener('DOMContentLoaded', async () => {
  const apiKeyInput = document.getElementById('apiKey');
  const saveBtn = document.getElementById('save');
  const startScanBtn = document.getElementById('startScan');
  const statusDiv = document.getElementById('status');

  // Load existing key
  const data = await chrome.storage.local.get(['geminiApiKey', 'isScanning']);
  if (data.geminiApiKey) {
    apiKeyInput.value = data.geminiApiKey;
    statusDiv.innerText = '✅ API Key Loaded';
    statusDiv.className = 'status ready';
  } else {
    statusDiv.innerText = '❌ Missing API Key';
    statusDiv.className = 'status missing';
  }

  // Update button state
  if (data.isScanning) {
    startScanBtn.innerText = 'Stop Live Scan';
    startScanBtn.classList.add('scanning');
  }

  // Save Key
  saveBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (key) {
      await chrome.storage.local.set({ geminiApiKey: key });
      statusDiv.innerText = '✅ Key Saved! Reloading...';
      statusDiv.className = 'status ready';

      // Notify background to reload from storage (simulating .env sync)
      chrome.runtime.sendMessage({ action: "reloadKeys" });

      setTimeout(() => {
        statusDiv.innerText = '✅ API Key Loaded';
      }, 2000);
    }
  });

  // Start/Stop Scan from Popup
  startScanBtn.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab) return;

    // Toggle local state
    const currentStatus = startScanBtn.innerText.includes('Start');
    const newState = currentStatus;

    chrome.tabs.sendMessage(tab.id, { action: "toggleScan", state: newState }, (response) => {
      if (chrome.runtime.lastError) {
        alert('Please refresh the meeting page first!');
        return;
      }

      if (newState) {
        startScanBtn.innerText = 'Stop Live Scan';
        startScanBtn.classList.add('scanning');
      } else {
        startScanBtn.innerText = 'Start Live Scan';
        startScanBtn.classList.remove('scanning');
      }

      chrome.storage.local.set({ isScanning: newState });
    });
  });
});
