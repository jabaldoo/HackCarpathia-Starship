(function() {
  let widget = null;
  let isScanning = false;
  let scanInterval = null;
  let apiKey = null;
  let faceBox = null;
  let lastBoxData = null;
  let lastVideoElement = null;

  async function init() {
    console.log('Gemini Guard: Initializing...');

    // Request background to reload keys just in case
    chrome.runtime.sendMessage({action: "reloadKeys"}, async (response) => {
      const data = await chrome.storage.local.get('geminiApiKey');
      apiKey = data.geminiApiKey;

      if (!apiKey) {
        console.error('Gemini Guard: No API Key found in storage.');
        // Still create widget so user knows it's active but needs a key
        createWidget();
        updateStatus('Missing API Key in .env', 'red');
      } else {
        console.log('Gemini Guard: API Key loaded.');
        createWidget();
      }
    });

    window.addEventListener('resize', repositionBox);
    window.addEventListener('scroll', repositionBox);
  }

  function repositionBox() {
    if (faceBox && lastBoxData && lastVideoElement) {
      updateFaceOverlay(lastVideoElement, lastBoxData.ymin, lastBoxData.xmin, lastBoxData.ymax, lastBoxData.xmax, lastBoxData.isFake);
    }
  }

  function createWidget() {
    if (document.getElementById('gemini-guard-widget')) return;

    widget = document.createElement('div');
    widget.id = 'gemini-guard-widget';
    widget.innerHTML = `
      <div class="gemini-header">
        <span>Gemini Call Guard</span>
        <button id="gemini-close">×</button>
      </div>
      <div class="gemini-content">
        <div id="gemini-status">Ready to scan</div>
        <div id="gemini-meter"><div id="gemini-progress"></div></div>
        <div id="gemini-results"></div>
      </div>
      <div class="gemini-footer">
        <button id="gemini-scan-toggle">Start Live Scan</button>
      </div>
    `;
    document.body.appendChild(widget);
    console.log('Gemini Guard: Widget injected.');

    document.getElementById('gemini-close').onclick = () => {
      stopScanning();
      if (faceBox) faceBox.remove();
      widget.remove();
    };
    document.getElementById('gemini-scan-toggle').onclick = toggleScan;

    makeDraggable(widget);
  }

  function toggleScan() {
    if (!apiKey) {
      alert('Please add your GOOGLE_API_KEY to the .env file and reload the extension.');
      return;
    }

    const btn = document.getElementById('gemini-scan-toggle');
    isScanning = !isScanning;

    if (isScanning) {
      btn.innerText = 'Stop Scan';
      btn.style.background = '#d93025';
      startScanning();
    } else {
      btn.innerText = 'Start Live Scan';
      btn.style.background = '#1a73e8';
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
    updateStatus('Scan stopped', 'grey');
  }

  async function performScan() {
    // Look for all videos, pick the one that is likely the main caller (usually larger)
    const videos = Array.from(document.querySelectorAll('video'));
    const video = videos.find(v => v.offsetWidth > 200 && v.readyState >= 2) || videos[0];

    if (!video) {
      updateStatus('No video detected', 'yellow');
      return;
    }

    updateStatus('Capturing frame...', 'blue');
    const imageData = captureFrame(video);

    updateStatus('Analyzing...', 'purple');
    try {
      const result = await analyzeWithGemini(imageData);
      displayResult(result, video);
    } catch (e) {
      updateStatus('Error: ' + e.message, 'red');
    }
  }

  function captureFrame(video) {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  }

  async function analyzeWithGemini(base64Image) {
    // Using 1.5-flash as default stable for better reliability, you can change to 2.0-flash-exp
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = `Analyze this frame from a video call.
    1. Find the bounding box of the main person's face. Return it as [ymin, xmin, ymax, xmax] in normalized coordinates (0-1000).
    2. Determine if the person is a deepfake or AI-generated.
    3. Provide a 'Confidence Score' from 0-100 (100 is definitely a deepfake).

    Format your response EXACTLY like this:
    BOX: [ymin, xmin, ymax, xmax]
    SCORE: [number]
    REASON: [short explanation]`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { inline_data: { mime_type: "image/jpeg", data: base64Image } }
          ]
        }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    return data.candidates[0].content.parts[0].text;
  }

  function displayResult(text, video) {
    const resultsDiv = document.getElementById('gemini-results');
    const statusDiv = document.getElementById('gemini-status');
    const progress = document.getElementById('gemini-progress');

    const scoreMatch = text.match(/SCORE:\s*(\d+)/i);
    const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
    const boxMatch = text.match(/BOX:\s*\[(\d+),\s*(\d+),\s*(\d+),\s*(\d+)\]/i);
    const isFake = score > 50;

    statusDiv.innerText = isFake ? '⚠️ HIGH RISK' : '✅ APPEARS AUTHENTIC';
    statusDiv.style.color = isFake ? '#d93025' : '#1e8e3e';

    progress.style.width = score + '%';
    progress.style.background = isFake ? '#d93025' : '#1e8e3e';

    const reason = text.split(/REASON:/i)[1] || text;
    resultsDiv.innerHTML = `<p>${reason.trim()}</p>`;

    if (boxMatch) {
      const [ymin, xmin, ymax, xmax] = boxMatch.slice(1).map(Number);
      lastBoxData = { ymin, xmin, ymax, xmax, isFake };
      lastVideoElement = video;
      updateFaceOverlay(video, ymin, xmin, ymax, xmax, isFake);
    }
  }

  function updateFaceOverlay(video, ymin, xmin, ymax, xmax, isFake) {
    if (!faceBox) {
      faceBox = document.createElement('div');
      faceBox.id = 'gemini-face-box';
      faceBox.style.cssText = `
        position: absolute;
        border: 4px solid;
        pointer-events: none;
        z-index: 2147483646;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        box-sizing: border-box;
      `;
      document.body.appendChild(faceBox);
    }

    const rect = video.getBoundingClientRect();
    const width = (xmax - xmin) / 1000 * rect.width;
    const height = (ymax - ymin) / 1000 * rect.height;
    const left = rect.left + (xmin / 1000 * rect.width);
    const top = rect.top + (ymin / 1000 * rect.height);

    faceBox.style.display = 'block';
    faceBox.style.width = \`\${width}px\`;
    faceBox.style.height = \`\${height}px\`;
    faceBox.style.left = \`\${window.scrollX + left}px\`;
    faceBox.style.top = \`\${window.scrollY + top}px\`;
    faceBox.style.borderColor = isFake ? '#d93025' : '#1e8e3e';
    faceBox.style.boxShadow = \`0 0 20px \${isFake ? 'rgba(217, 48, 37, 0.6)' : 'rgba(30, 142, 62, 0.6)'}\`;

    faceBox.innerHTML = \`
      <div style="
        position: absolute;
        top: -28px;
        left: -4px;
        background: \${isFake ? '#d93025' : '#1e8e3e'};
        color: white;
        padding: 2px 10px;
        font-size: 11px;
        font-weight: bold;
        border-radius: 4px 4px 0 0;
        white-space: nowrap;
        text-transform: uppercase;
      ">
        \${isFake ? 'DEEPFAKE ALERT' : 'REAL PERSON'}
      </div>
    \`;
  }

  function updateStatus(text, color) {
    const statusDiv = document.getElementById('gemini-status');
    if (statusDiv) {
      statusDiv.innerText = text;
      statusDiv.style.color = color === 'red' ? '#d93025' : (color === 'blue' ? '#1a73e8' : (color === 'purple' ? '#a142f4' : '#5f6368'));
    }
  }

  function makeDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    const header = el.querySelector('.gemini-header');
    if (header) {
      header.onmousedown = (e) => {
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = () => {
          document.onmouseup = null;
          document.onmousemove = null;
        };
        document.onmousemove = (e) => {
          e.preventDefault();
          pos1 = pos3 - e.clientX;
          pos2 = pos4 - e.clientY;
          pos3 = e.clientX;
          pos4 = e.clientY;
          el.style.top = (el.offsetTop - pos2) + "px";
          el.style.left = (el.offsetLeft - pos1) + "px";
        };
      };
    }
  }

  init();
})();
