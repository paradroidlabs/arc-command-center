const statusEl = document.getElementById('status');
const canvas = document.getElementById('screenshot-canvas');
const ctx = canvas.getContext('2d');
const overlayContainer = document.getElementById('overlay-container');
const canvasContainer = document.getElementById('canvas-container');

let ws;

function connect() {
    statusEl.textContent = "Connecting to backend...";
    ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = () => {
        statusEl.textContent = "Ready. Press Ctrl+Shift+T or click 'Capture & Translate'.";
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        renderData(data);
    };

    ws.onclose = () => {
        statusEl.textContent = "Disconnected. Reconnecting...";
        setTimeout(connect, 3000);
    };
    
    ws.onerror = (err) => {
        console.error("WebSocket error", err);
    };
}

let currentImg = null;
let currentData = null;

function renderData(data) {
    statusEl.textContent = "Rendering screenshot and translation...";
    currentData = data;
    
    const img = new Image();
    img.onload = () => {
        currentImg = img;
        // Set canvas to actual image resolution
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        updateOverlays();
        statusEl.textContent = "Ready. Press Ctrl+Shift+T or click button for next.";
    };
    img.src = data.image;
}

function updateOverlays() {
    if (!currentImg || !currentData) return;
    
    // Clear any old translations
    overlayContainer.innerHTML = '';

    // Calculate visual scaling
    // The canvas uses max-width/max-height, so its visual size might be smaller than natural size
    const rect = canvas.getBoundingClientRect();
    
    // Position the overlay container perfectly over the canvas visually
    overlayContainer.style.width = `${rect.width}px`;
    overlayContainer.style.height = `${rect.height}px`;
    
    // Since canvas-container is flex-center, find offsets
    const containerRect = canvasContainer.getBoundingClientRect();
    const offsetX = rect.left - containerRect.left;
    const offsetY = rect.top - containerRect.top;
    
    overlayContainer.style.left = `${offsetX}px`;
    overlayContainer.style.top = `${offsetY}px`;

    // Render each translation box using percentages so they scale natively within the exact overlay container
    currentData.translations.forEach(t => {
        const x1 = t.bbox[0][0];
        const y1 = t.bbox[0][1];
        const x2 = t.bbox[1][0];
        const y2 = t.bbox[2][1];
        
        const width = x2 - x1;
        const height = y2 - y1;

        const div = document.createElement('div');
        div.className = 'translated-box';
        
        div.style.left = `${(x1 / currentImg.width) * 100}%`;
        div.style.top = `${(y1 / currentImg.height) * 100}%`;
        div.style.width = `${(width / currentImg.width) * 100}%`;
        div.style.height = `${(height / currentImg.height) * 100}%`;
        
        div.textContent = t.translated_text;
        div.title = `Original: ${t.original_text}\nConfidence: ${(t.confidence*100).toFixed(1)}%`;
        
        // Calculate the actual visual height of this box on the screen
        const visualHeight = (height / currentImg.height) * rect.height;
        // Make font size 80% of the visual height, with a minimum of 10px so it's always readable
        div.style.fontSize = `${Math.max(10, visualHeight * 0.8)}px`;
        
        overlayContainer.appendChild(div);
    });
}

// Redraw overlays on resize or zoom so they stay perfectly pinned to the image
window.addEventListener('resize', updateOverlays);

function triggerTranslation() {
    statusEl.textContent = "Requesting capture...";
    fetch('/api/trigger').catch(err => {
        console.error("Failed to trigger translation:", err);
        statusEl.textContent = "Failed to trigger capture.";
    });
}

connect();
