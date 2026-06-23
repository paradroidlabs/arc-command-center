import asyncio
import logging
import cv2
from deep_translator import GoogleTranslator

logger = logging.getLogger(__name__)

# Try to import Windows SDK for native OCR
try:
    from winsdk.windows.media.ocr import OcrEngine
    from winsdk.windows.globalization import Language
    from winsdk.windows.graphics.imaging import BitmapDecoder
    from winsdk.windows.storage.streams import InMemoryRandomAccessStream, DataWriter
    WIN_OCR_AVAILABLE = True
except ImportError:
    logger.error("winsdk not found. Windows native OCR unavailable.")
    WIN_OCR_AVAILABLE = False

async def process_image_async(img_numpy):
    """
    Takes an OpenCV image (numpy array), runs Windows Native OCR, and translates it.
    Returns a list of results with bounding boxes and translated text.
    """
    if not WIN_OCR_AVAILABLE:
        logger.error("Windows OCR not available.")
        return []

    results = []
    try:
        # 1. Encode image to PNG in memory
        success, buffer = cv2.imencode('.png', img_numpy)
        if not success:
            logger.error("Failed to encode image to PNG for OCR.")
            return []

        # 2. Write to WinRT Stream
        stream = InMemoryRandomAccessStream()
        writer = DataWriter(stream)
        writer.write_bytes(buffer.tobytes())
        await writer.store_async()
        await writer.flush_async()
        writer.detach_stream()
        stream.seek(0)

        # 3. Decode into a SoftwareBitmap
        decoder = await BitmapDecoder.create_async(stream)
        software_bitmap = await decoder.get_software_bitmap_async()

        # 4. Check Language support and create
        try:
            lang = Language("zh-Hans")
            engine = OcrEngine.try_create_from_language(lang)
            if engine is None:
                raise ValueError("OcrEngine creation failed")
        except Exception as e:
            logger.error("Chinese (Simplified) language pack not installed! Falling back to English for testing.")
            lang = Language("en-US")
            engine = OcrEngine.try_create_from_language(lang)
            if engine is None:
                return [{
                    "box": [[100, 100], [800, 100], [800, 200], [100, 200]],
                    "original": "ERROR: OCR ENGINE FAILED",
                    "translated": "Failed to create even the English OCR engine."
                }]

        # 5. Recognize Text
        ocr_result = await engine.recognize_async(software_bitmap)

        translator = GoogleTranslator(source='auto', target='en')

        # 6. Process results
        for line in ocr_result.lines:
            text = line.text.strip()
            if not text:
                continue
                
            try:
                translated = translator.translate(text)
            except Exception as e:
                logger.error(f"Translation failed for '{text}': {e}")
                translated = "[Error]"

            # Windows OCR line doesn't have a bounding_rect, we must calculate it from words
            words = list(line.words)
            if not words:
                continue
                
            x1 = int(min(w.bounding_rect.x for w in words))
            y1 = int(min(w.bounding_rect.y for w in words))
            x2 = int(max(w.bounding_rect.x + w.bounding_rect.width for w in words))
            y2 = int(max(w.bounding_rect.y + w.bounding_rect.height for w in words))
            
            cleaned_bbox = [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]

            results.append({
                "bbox": cleaned_bbox,
                "original_text": text,
                "translated_text": translated,
                "confidence": 1.0 # Windows OCR does not provide confidence per line easily
            })
            
    except Exception as e:
        logger.error(f"OCR processing failed: {e}")
        
    return results

def process_image(img_numpy):
    """Synchronous wrapper for the async OCR function"""
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
    if loop.is_running():
        # This shouldn't happen in our thread pool setup, but just in case
        import nest_asyncio
        nest_asyncio.apply()
        
    return loop.run_until_complete(process_image_async(img_numpy))
