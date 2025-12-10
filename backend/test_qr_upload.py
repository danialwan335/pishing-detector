import requests
import cv2
import numpy as np
import io

# Create a dummy image (black square)
img = np.zeros((100, 100, 3), dtype=np.uint8)
is_success, buffer = cv2.imencode(".png", img)
io_buf = io.BytesIO(buffer)

url = "http://localhost:8000/api/scan/qr"
files = {"file": ("test.png", io_buf, "image/png")}

try:
    print(f"Sending request to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
