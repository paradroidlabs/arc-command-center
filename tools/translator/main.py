import asyncio
import base64
import cv2
from pynput import keyboard as pynput_kb
import threading
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

import capture
import ocr

app = FastAPI()

# Mount the static directory for the frontend
app.mount("/static", StaticFiles(directory="static"), name="static")

# Store active websocket connections
active_connections = []

@app.get("/")
async def get_index():
    return FileResponse("static/index.html")

@app.get("/api/trigger")
async def manual_trigger():
    """Endpoint for the Web UI to manually trigger a translation."""
    # We run it in a background thread so it doesn't block the API response
    threading.Thread(target=trigger_translation_pipeline).start()
    return {"status": "triggered"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_connections.append(websocket)
    try:
        while True:
            # Keep connection open
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        active_connections.remove(websocket)

async def broadcast_result(image_base64: str, results: list):
    """Sends the processed data to all connected clients."""
    payload = json.dumps({
        "image": f"data:image/jpeg;base64,{image_base64}",
        "translations": results
    })
    for connection in active_connections:
        try:
            await connection.send_text(payload)
        except Exception as e:
            print(f"Failed to send to a websocket client: {e}")

def trigger_translation_pipeline():
    """
    Called when the hotkey is pressed.
    Captures the screen, runs OCR + Translation, and broadcasts the result.
    """
    print("Hotkey triggered! Capturing screen...")
    
    img = capture.capture_screen()
    if img is None:
        print("Failed to capture screen.")
        return
        
    print("Screen captured. Processing OCR and translating...")
    results = ocr.process_image(img)
    
    # Convert image to base64 to send to frontend
    success, buffer = cv2.imencode('.jpg', img, [cv2.IMWRITE_JPEG_QUALITY, 85])
    if not success:
        print("Failed to encode image.")
        return
        
    img_b64 = base64.b64encode(buffer).decode('utf-8')
    
    print("Processing complete. Broadcasting to UI...")
    
    if _main_loop is not None:
        asyncio.run_coroutine_threadsafe(broadcast_result(img_b64, results), _main_loop)

_main_loop = None

@app.on_event("startup")
async def startup_event():
    global _main_loop
    _main_loop = asyncio.get_running_loop()
    
    # Start the hotkey listener in a background thread
    def on_activate():
        trigger_translation_pipeline()
        
    def listen_for_hotkeys():
        print("Starting pynput hotkey listener on 'ctrl+shift+t'...")
        with pynput_kb.GlobalHotKeys({'<ctrl>+<shift>+t': on_activate}) as h:
            h.join()

    hotkey_thread = threading.Thread(target=listen_for_hotkeys, daemon=True)
    hotkey_thread.start()

if __name__ == "__main__":
    import uvicorn
    import os
    if not os.path.exists("static"):
        os.makedirs("static")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
