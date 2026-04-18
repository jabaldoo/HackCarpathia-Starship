// FakeLess Video Call Deepfake Detection
// Detects deepfakes in video calls (Google Meet, Zoom, Teams)

(function() {
  let widget = null;
  let isScanning = false;
  let scanInterval = null;
  let apiKey = null;
  let faceBox = null;

  console.log('FakeLess: Video call scanner loaded');

  async function init() {
    // Load API key
    const data = await browser.storage.local.get('geminiApiKey');
    apiKey = data.geminiApiKey;
    
    // Also try sync storage
    if (!apiKey) {
      const syncData = await browser.storage.sync.get('geminiApiKey');
      apiKey = syncData.geminiApiKey;
    }

    // Check for active video every 2 seconds
    const callCheckInterval = setInterval(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      const activeVideo = videos.find(v => v.offsetWidth > 100 && v.readyState >= 2);

      if (activeVideo && !widget) {
        createWidget();
      }
    }, 2000);

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
    if (document.getElementById('fakeless-video-widget')) return;

    widget = document.createElement('div');
    widget.id = 'fakeless-video-widget';
    widget.style.cssText = 'position:fixed; top:20px; right:20px; width:300px; background:#001529; border-radius:12px; z-index:2147483647; border:1px solid #1890ff; box-shadow:0 10px 40px rgba(0,0,0,0.5); font-family:sans-serif; overflow:hidden; display:flex; flex-direction:column;';

    widget.innerHTML = `
      <div class="fakeless-header" style="background:#001529; color:white; padding:12px; cursor:move; display:flex; justify-content:space-between; font-weight:bold; border-bottom: 1px solid #1890ff;">
        <span>FakeLess Guard</span>
        <button id="fakeless-close" style="background:none; border:none; color:white; cursor:pointer; font-size:18px;">×</button>
      </div>
      <div class="fakeless-content" style="padding:15px; color:white; background:#001529;">
        <div style="display:flex; justify-content:center; align-items:center; margin-bottom:10px;">
          <img id="fakeless-lvl-icon" style="width:40px; height:40px; display:none;" />
          <div id="fakeless-status" style="font-weight:bold; margin-left:10px; color:white;">READY</div>
        </div>
        <div id="fakeless-snapshot-container" style="width:100%; height:150px; background:#000c17; border-radius:8px; margin-bottom:10px; display:flex; align-items:center; justify-content:center; overflow:hidden; border:1px solid #1890ff;">
           <img id="fakeless-snapshot" style="display:none; max-width:100%; max-height:100%;" />
           <span id="fakeless-placeholder" style="color:#ffffff; font-size:12px;">Waiting for scan...</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px; color:white;">
           <span>Deepfake Score</span>
           <span id="fakeless-percent">0%</span>
        </div>
        <div style="height:8px; background:#000c17; border-radius:4px; overflow:hidden; margin-bottom:10px; border:1px solid #1890ff;">
           <div id="fakeless-progress" style="height:100%; width:0%; background:#1890ff; transition:width 0.5s;"></div>
        </div>
        <div id="fakeless-results" style="font-size:12px; background:#000c17; padding:10px; border-radius:6px; max-height:80px; overflow-y:auto; border:1px solid #1890ff; color:white;">Results will appear here...</div>
      </div>
      <div class="fakeless-footer" style="padding:10px; border-top:1px solid #1890ff; background:#001529;">
        <button id="fakeless-scan-toggle" style="width:100%; padding:10px; background:transparent; color:white; border:1px solid #1890ff; border-radius:6px; cursor:pointer; font-weight:bold; transition: 0.3s;">START LIVE SCAN</button>
      </div>
    `;

    document.body.appendChild(widget);

    document.getElementById('fakeless-close').onclick = () => { widget.remove(); widget = null; };
    document.getElementById('fakeless-scan-toggle').onclick = () => browser.runtime.sendMessage({action: "broadcastToggle"});

    const btn = document.getElementById('fakeless-scan-toggle');
    btn.onmouseover = () => { btn.style.background = '#1890ff'; btn.style.color = '#001529'; };
    btn.onmouseout = () => { if(!isScanning) { btn.style.background = 'transparent'; btn.style.color = 'white'; } };

    makeDraggable(widget);
  }

  function toggleScan() {
    if (!widget) createWidget();
    isScanning = !isScanning;
    const btn = document.getElementById('fakeless-scan-toggle');
    if (isScanning) {
      if (btn) {
        btn.innerText = 'STOP SCAN';
        btn.style.background = '#d93025';
        btn.style.borderColor = '#d93025';
        btn.style.color = 'white';
      }
      startScanning();
    } else {
      if (btn) {
        btn.innerText = 'START LIVE SCAN';
        btn.style.background = 'transparent';
        btn.style.borderColor = '#1890ff';
        btn.style.color = 'white';
      }
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
    updateStatusUI('SCAN STOPPED', 'white');
  }

  async function performScan() {
    const videos = Array.from(document.querySelectorAll('video'));
    const video = videos.find(v => v.offsetWidth > 150 && v.readyState >= 2) || videos[0];

    if (!video || video.readyState < 2) {
      updateStatusUI('No video found', '#f9ab00');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    updateStatusUI('CAPTURING...', '#1890ff');

    try {
      if (!apiKey) {
        const data = await browser.storage.local.get('geminiApiKey');
        apiKey = data.geminiApiKey;
        if (!apiKey) {
          const syncData = await browser.storage.sync.get('geminiApiKey');
          apiKey = syncData.geminiApiKey;
        }
      }

      if (!apiKey) {
        updateStatusUI('No API Key', '#d93025');
        return;
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

      browser.runtime.sendMessage({
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
      console.error('FakeLess Scan Error:', e);
      updateStatusUI('API Error', '#d93025');
    }
  }

  function updateStatusUI(text, color) {
    const status = document.getElementById('fakeless-status');
    if (status) { status.innerText = text; status.style.color = color; }
  }

  function updateUI(msg) {
    const status = document.getElementById('fakeless-status');
    const icon = document.getElementById('fakeless-lvl-icon');
    const percent = document.getElementById('fakeless-percent');
    const progress = document.getElementById('fakeless-progress');
    const results = document.getElementById('fakeless-results');
    const img = document.getElementById('fakeless-snapshot');
    const placeholder = document.getElementById('fakeless-placeholder');

    const scoreMatch = msg.text.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;

    let trustText = "";
    let color = "";
    let iconName = "";

    if (score <= 25) { trustText = "REAL"; color = "#1e8e3e"; iconName = "lvl1.png"; }
    else if (score <= 50) { trustText = "MOST LIKELY REAL"; color = "#8ab4f8"; iconName = "lvl2.png"; }
    else if (score <= 75) { trustText = "NOT SO REAL"; color = "#f9ab00"; iconName = "lvl3.png"; }
    else { trustText = "FAKE"; color = "#d93025"; iconName = "lvl4.png"; }

    if (status) { status.innerText = trustText; status.style.color = color; }
    if (icon) { icon.src = browser.runtime.getURL('lvl/' + iconName); icon.style.display = 'block'; }
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
      faceBox.id = 'fakeless-face-overlay';
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
    const header = el.querySelector('.fakeless-header');
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
