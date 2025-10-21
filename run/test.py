import streamlit as st
import cv2
import torch
from ultralytics import YOLO

st.set_page_config(page_title="YOLOv11 Real-time", layout="wide")

# Sidebar
st.sidebar.title("YOLOv11 Real-time Inference")
model_path = st.sidebar.text_input("Model path", r"D:\WORK\Python\CV\Webapp_vsl\model\v9_l_yolo11.pt")
imgsz = st.sidebar.slider("Image size", 320, 640, 480, step=80)
conf = st.sidebar.slider("Confidence threshold", 0.1, 1.0, 0.5, 0.05)
run_button = st.sidebar.button("▶ Start Camera")

# Main UI
st.title("⚽ YOLOv11 Realtime Camera (Performance Test)")
frame_window = st.image([])

if run_button:
    # Load YOLO model
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model = YOLO(model_path)
    model.to(device)
    model.fuse()

    cap = cv2.VideoCapture(0)
    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)

    st.write("Press **Stop** (top-right) or close tab to exit")

    while True:
        ret, frame = cap.read()
        if not ret:
            st.warning("Camera feed not found.")
            break

        results = model.predict(frame, imgsz=imgsz, conf=conf, device=device, verbose=False)
        annotated = results[0].plot()

        frame_window.image(annotated, channels="BGR", use_column_width=True)

    cap.release()
