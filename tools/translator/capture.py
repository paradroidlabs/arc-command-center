import numpy as np
import cv2
import mss
import logging
from typing import Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Try to import dxcam, but fall back gracefully if it fails (e.g. on non-Windows)
try:
    import dxcam
    camera = dxcam.create()
except ImportError:
    logger.warning("dxcam not found or not supported. Falling back to mss only.")
    camera = None
except Exception as e:
    logger.warning(f"Failed to initialize dxcam: {e}. Falling back to mss only.")
    camera = None

def capture_screen() -> Optional[np.ndarray]:
    """
    Captures the primary monitor. 
    Attempts to use dxcam first (best for exclusive fullscreen on Windows).
    Falls back to mss (best for borderless/windowed or non-Windows).
    Returns an OpenCV image (numpy array in BGR format) or None on failure.
    """
    img = None
    
    # Try dxcam first
    if camera is not None:
        try:
            # Grab a frame. dxcam returns RGB
            frame = camera.grab()
            if frame is not None:
                # Convert RGB to BGR for OpenCV
                img = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                return img
        except Exception as e:
            logger.error(f"dxcam capture failed: {e}")

    # Fallback to mss
    try:
        with mss.mss() as sct:
            # Monitor 1 is the primary monitor
            monitor = sct.monitors[1]
            sct_img = sct.grab(monitor)
            # Convert mss image to numpy array (BGRA)
            img = np.array(sct_img)
            # Convert BGRA to BGR
            img = cv2.cvtColor(img, cv2.COLOR_BGRA2BGR)
            return img
    except Exception as e:
        logger.error(f"mss capture failed: {e}")
        
    return img

if __name__ == "__main__":
    # Test capture
    img = capture_screen()
    if img is not None:
        print(f"Captured successfully! Shape: {img.shape}")
        # Uncomment to test viewing
        # cv2.imshow("Test Capture", img)
        # cv2.waitKey(0)
    else:
        print("Failed to capture screen.")
