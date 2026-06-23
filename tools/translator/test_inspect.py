import asyncio
import cv2
import numpy as np

try:
    from winsdk.windows.media.ocr import OcrEngine
    from winsdk.windows.globalization import Language
    from winsdk.windows.graphics.imaging import BitmapDecoder
    from winsdk.windows.storage.streams import InMemoryRandomAccessStream, DataWriter
except ImportError:
    pass

async def test():
    # create a white image with some black text to ensure OCR finds it
    img_numpy = np.ones((100, 300, 3), dtype=np.uint8) * 255
    cv2.putText(img_numpy, 'Hello World', (10, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2, cv2.LINE_AA)
    
    success, buffer = cv2.imencode('.png', img_numpy)
    stream = InMemoryRandomAccessStream()
    writer = DataWriter(stream)
    writer.write_bytes(buffer.tobytes())
    await writer.store_async()
    await writer.flush_async()
    writer.detach_stream()
    stream.seek(0)
    decoder = await BitmapDecoder.create_async(stream)
    software_bitmap = await decoder.get_software_bitmap_async()
    lang = Language("en-US")
    engine = OcrEngine.try_create_from_language(lang)
    ocr_result = await engine.recognize_async(software_bitmap)
    if ocr_result and len(ocr_result.lines) > 0:
        line = ocr_result.lines[0]
        print("Line properties:", dir(line))
        word = line.words[0]
        print("Word properties:", dir(word))
    else:
        print("No lines found")

asyncio.run(test())
