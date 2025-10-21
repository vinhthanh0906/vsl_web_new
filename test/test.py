import cv2
import torch
from ultralytics import YOLO
import time

# === Load YOLO model ===
model_path = r"D:\WORK\Python\CV\Webapp_vsl\model\v9_n_yolo11.pt"  # change to your model path
model = YOLO(model_path)

# Select device (GPU if available)
device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)

# === Choose camera ===
# 0 = default webcam; change to RTSP/URL for IP camera
# Example: "rtsp://username:password@192.168.1.10:554/stream"
camera_source = 0

cap = cv2.VideoCapture(camera_source)

# Optional: tune resolution & FPS
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)

# === Realtime loop ===
prev_time = 0
while True:
    success, frame = cap.read()
    if not success:
        print("⚠️ Failed to read frame from camera")
        break

    # --- Run YOLO inference ---
    results = model(frame, stream=True, verbose=False)

    # --- Draw detections on frame ---
    for r in results:
        annotated_frame = r.plot()

    # --- FPS counter ---
    curr_time = time.time()
    fps = 1 / (curr_time - prev_time) if prev_time != 0 else 0
    prev_time = curr_time

    # --- Display ---
    cv2.putText(annotated_frame, f"FPS: {fps:.2f}", (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    cv2.imshow("YOLO Realtime Camera", annotated_frame)

    # Exit on 'q' key
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
