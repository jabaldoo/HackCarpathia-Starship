(function() {
  let widget = null;
  let isScanning = false;
  let scanInterval = null;
  let apiKey = null;
  let faceBox = null;

  console.log('Gemini Guard: Content script loaded');

  async function init() {
    // 1. Load API key immediately
    const data = await chrome.storage.local.get('geminiApiKey');
    apiKey = data.geminiApiKey;
    console.log('Gemini Guard: API Key status:', !!apiKey);

    // 2. Start checking for a meeting/call (video elements)
    const callCheckInterval = setInterval(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      const activeVideo = videos.find(v => v.offsetWidth > 100 && v.readyState >= 2);

      if (activeVideo && !widget) {
        console.log('Gemini Guard: Call detected! Injecting widget...');
        createWidget();
      }
    }, 2000);

    // 3. Listen for messages from background/popup
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "toggleScan") {
        toggleScan();
        if (sendResponse) sendResponse({success: true});
      }
      if (message.action === "updateUI" && window.top === window.self) {
        updateUI(message);
      }
    });
  }

  function createWidget() {
    if (document.getElementById('gemini-guard-widget')) return;

    widget = document.createElement('div');
    widget.id = 'gemini-guard-widget';
    // Forced inline styles to prevent "white box" issue if CSS fails to load
    widget.style.cssText = 'position:fixed; top:20px; right:20px; width:300px; background:white; border-radius:12px; z-index:2147483647; border:1px solid #ccc; box-shadow:0 10px 30px rgba(0,0,0,0.3); font-family:sans-serif; overflow:hidden; display:flex; flex-direction:column;';

    widget.innerHTML = `
      <div class="gemini-header" style="background:#1a73e8; color:white; padding:12px; cursor:move; display:flex; justify-content:space-between; font-weight:bold;">
        <span>Gemini Deepfake Guard</span>
        <button id="gemini-close" style="background:none; border:none; color:white; cursor:pointer; font-size:18px;">×</button>
      </div>
      <div class="gemini-content" style="padding:15px; color:#333;">
        <div style="display:flex; justify-content:center; align-items:center; margin-bottom:10px;">
          <img id="gemini-lvl-icon" style="width:40px; height:40px; display:none;" />
          <div id="gemini-status" style="font-weight:bold; margin-left:10px;">READY</div>
        </div>
        <div id="gemini-snapshot-container" style="width:100%; height:150px; background:#eee; border-radius:8px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid #ddd;">
           <img id="gemini-snapshot" style="display:none; max-width:100%; max-height:100%;" />
           <span id="gemini-placeholder" style="color:#666; font-size:12px;">Waiting for scan...</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
           <span id="gemini-trust-label">Deepfake Score</span>
           <span id="gemini-percent">0%</span>
        </div>
        <div style="height:8px; background:#eee; border-radius:4px; overflow:hidden; margin-bottom:10px;">
           <div id="gemini-progress" style="height:100%; width:0%; background:#1a73e8; transition:width 0.5s;"></div>
        </div>
        <div id="gemini-results" style="font-size:12px; background:#f9f9f9; padding:8px; border-radius:4px; max-height:80px; overflow-y:auto; border:1px solid #eee;">Results will appear here...</div>
      </div>
      <div class="gemini-footer" style="padding:10px; border-top:1px solid #eee;">
        <button id="gemini-scan-toggle" style="width:100%; padding:10px; background:#1a73e8; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">START LIVE SCAN</button>
      </div>
    `;

    document.body.appendChild(widget);

    document.getElementById('gemini-close').onclick = () => { widget.remove(); widget = null; };
    document.getElementById('gemini-scan-toggle').onclick = () => chrome.runtime.sendMessage({action: "broadcastToggle"});

    makeDraggable(widget);
  }

  function toggleScan() {
    if (!widget) createWidget();
    isScanning = !isScanning;
    const btn = document.getElementById('gemini-scan-toggle');
    if (isScanning) {
      if (btn) { btn.innerText = 'STOP SCAN'; btn.style.background = '#d93025'; }
      startScanning();
    } else {
      if (btn) { btn.innerText = 'START LIVE SCAN'; btn.style.background = '#1a73e8'; }
      stopScanning();
    }
  }

  function startScanning() {
    performScan();
    scanInterval = setInterval(performScan, 10000);
  }

  function stopScanning() {
    clearInterval(scanInterval);
    if (faceBox) faceBox.style.display = 'none';
    const status = document.getElementById('gemini-status');
    const icon = document.getElementById('gemini-lvl-icon');
    if (status) status.innerText = 'SCAN STOPPED';
    if (icon) icon.style.display = 'none';
  }

  async function performScan() {
    const videos = Array.from(document.querySelectorAll('video'));
    const video = videos.find(v => v.offsetWidth > 150 && v.readyState >= 2) || videos[0];

    if (!video || video.readyState < 2) {
      updateStatusUI('No video stream found', 'orange');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    updateStatusUI('Capturing...', '#1a73e8');

    try {
      if (!apiKey) {
        const data = await chrome.storage.local.get('geminiApiKey');
        apiKey = data.geminiApiKey;
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{ parts: [
            { text: "Analyze this video call frame. Detect if it is a deepfake. Return exactly: 'SCORE: [0-100]' (where 100 is fake and 0 is real) and 'REASON: [short explanation]'. Also find the main face and return 'BOX: [ymin, xmin, ymax, xmax]' in 0-1000 normalized coords." },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]}]
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.candidates[0].content.parts[0].text;

      chrome.runtime.sendMessage({
        action: "updateUI",
        text: text,
        image: 'data:image/jpeg;base64,' + base64Image
      });

      const boxMatch = text.match(/BOX:\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/i);
      if (boxMatch) {
        const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        const [ymin, xmin, ymax, xmax] = boxMatch.slice(1).map(Number);
        updateFaceBox(video, ymin, xmin, ymax, xmax, score);
      }
    } catch (e) {
      console.error('Scan Error:', e);
      updateStatusUI('API Error: ' + e.message, 'red');
    }
  }

  function updateStatusUI(text, color) {
    const status = document.getElementById('gemini-status');
    if (status) { status.innerText = text; status.style.color = color; }
  }

  function updateUI(msg) {
    const status = document.getElementById('gemini-status');
    const icon = document.getElementById('gemini-lvl-icon');
    const percent = document.getElementById('gemini-percent');
    const progress = document.getElementById('gemini-progress');
    const results = document.getElementById('gemini-results');
    const img = document.getElementById('gemini-snapshot');
    const placeholder = document.getElementById('gemini-placeholder');

    const scoreMatch = msg.text.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    let trustText = "";
    let color = "";
    let iconName = "";

    if (score <= 25) {
      trustText = "REAL";
      color = "#1e8e3e";
      iconName = "lvl1.png";
    } else if (score <= 50) {
      trustText = "MOST LIKELY REAL";
      color = "#8ab4f8";
      iconName = "lvl2.png";
    } else if (score <= 75) {
      trustText = "NOT SO REAL";
      color = "#f9ab00";
      iconName = "lvl3.png";
    } else {
      trustText = "FAKE";
      color = "#d93025";
      iconName = "lvl4.png";
    }

    if (status) {
      status.innerText = trustText;
      status.style.color = color;
    }
    if (icon) {
      icon.src = chrome.runtime.getURL('lvl/' + iconName);
      icon.style.display = 'block';
    }
    if (percent) percent.innerText = score + '%';
    if (progress) {
      progress.style.width = score + '%';
      progress.style.background = color;
    }
    if (results) results.innerText = msg.text.split('REASON:')[1] || msg.text;
    if (img) {
      img.src = msg.image;
      img.style.display = 'block';
      if (placeholder) placeholder.style.display = 'none';
    }
  }

  function updateFaceBox(video, ymin, xmin, ymax, xmax, score) {
    if (!faceBox) {
      faceBox = document.createElement('div');
      faceBox.id = 'gemini-face-overlay';
      faceBox.style.cssText = 'position:absolute; border:4px solid; pointer-events:none; z-index:2147483646; transition: all 0.3s;';
      document.body.appendChild(faceBox);
    }
    const rect = video.getBoundingClientRect();
    faceBox.style.display = 'block';
    faceBox.style.width = ((xmax - xmin) / 1000 * rect.width) + 'px';
    faceBox.style.height = ((ymax - ymin) / 1000 * rect.height) + 'px';
    faceBox.style.left = (window.scrollX + rect.left + (xmin / 1000 * rect.width)) + 'px';
    faceBox.style.top = (window.scrollY + rect.top + (ymin / 1000 * rect.height)) + 'px';

    let color = "";
    if (score <= 25) color = "#1e8e3e";
    else if (score <= 50) color = "#8ab4f8";
    else if (score <= 75) color = "#f9ab00";
    else color = "#d93025";

    faceBox.style.borderColor = color;
  }

  function makeDraggable(el) {
    const header = el.querySelector('.gemini-header');
    header.onmousedown = (e) => {
      let pos1 = 0, pos2 = 0, pos3 = e.clientX, pos4 = e.clientY;
      document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
      document.onmousemove = (e) => {
        pos1 = pos3 - e.clientX; pos2 = pos4 - e.clientY;
        pos3 = e.clientX; pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px"; el.style.left = (el.offsetLeft - pos1) + "px";
      };
    };
  }

  init();
})();
