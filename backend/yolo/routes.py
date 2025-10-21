# backend/yolo/routes.py
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from ultralytics import YOLO
import cv2, numpy as np, base64

router = APIRouter(prefix="/yolo", tags=["YOLO"])
model = YOLO(r"D:\WORK\Python\web\web_app_vsl\backend\yolo\model\v9_n_yolo11.pt")

@router.post("/predict")
async def predict(request: Request):
    data = await request.json()
    img_base64 = data.get("image")
    if not img_base64:
        return JSONResponse({"error": "No image data received"}, status_code=400)

    img_bytes = base64.b64decode(img_base64.split(",")[1])
    nparr = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    results = model(img, verbose=False)
    boxes = results[0].boxes

    detections = []
    for box in boxes:
        xyxy = box.xyxy[0].cpu().numpy().tolist()
        x1, y1, x2, y2 = map(int, xyxy)
        detections.append({
            "class": model.names[int(box.cls)],
            "confidence": float(box.conf),
            "bbox": [x1, y1, x2, y2]
        })

    return {"detections": detections}
