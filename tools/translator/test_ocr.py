import capture
import ocr
import time

print("Testing capture...")
img = capture.capture_screen()
if img is not None:
    print(f"Captured: {img.shape}")
    print("Testing OCR...")
    t0 = time.time()
    results = ocr.process_image(img)
    t1 = time.time()
    print(f"OCR finished in {t1-t0:.2f} seconds")
    print(f"Results: {results}")
else:
    print("Capture failed.")
