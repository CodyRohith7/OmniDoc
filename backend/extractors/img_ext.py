import pytesseract
from PIL import Image
import os
import platform

# Cross-platform Tesseract setup
if platform.system() == "Windows":
    # User's specific Windows path
    tesseract_win_path = r'C:\Users\codyr\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'
    if os.path.exists(tesseract_win_path):
        pytesseract.pytesseract.tesseract_cmd = tesseract_win_path
else:
    # Standard Linux path for Docker/Cloud
    pytesseract.pytesseract.tesseract_cmd = '/usr/bin/tesseract'

def extract_text_from_image(file_path: str) -> str:
    text = ""
    try:
        img = Image.open(file_path)
        # Using PSM 3 for faster, standard document analysis (no OSD overhead) to avoid timeouts
        text = pytesseract.image_to_string(img, config='--psm 3')
    except Exception as e:
        print(f"Error extracting Image OCR: {e}")
        raise Exception(f"OCR Error: {e}. Ensure Tesseract is installed on the host/container.")
    return text
