import streamlit as st
from ultralytics import YOLO
import cv2
from PIL import Image
import numpy as np
import time
import torch

# --- Helper: Safe load YOLO model ---
def safe_load_yolo(weights_path: str):
    try:
        return YOLO(weights_path)
    except Exception as e:
        if "Unsupported global" in str(e) or "Weights only load failed" in str(e):
            try:
                from torch.serialization import add_safe_globals
                from ultralytics.nn.tasks import DetectionModel
                add_safe_globals([DetectionModel])
                return YOLO(weights_path)
            except Exception as e2:
                st.error("Failed to safe-load the model.")
                raise e2
        else:
            raise e

# --- Streamlit UI setup ---
st.set_page_config(page_title="YOLO Sign Practice", layout="wide")
st.title("🖐️ Sign Language Practice (YOLO Realtime)")

# Sidebar setup
with st.sidebar:
    st.header("Model & Source")
    model_path = st.text_input("Model path or hub ID", value="path/to/your_model.pt")
    device_choice = st.selectbox("Device", ("CPU", "GPU"))

    device = torch.device("cuda:0") if device_choice == "GPU" and torch.cuda.is_available() else torch.device("cpu")

    use_half = st.checkbox("Use FP16 (half)", value=False)
    run_mode = st.selectbox("Mode", ["Webcam", "Video file", "Image upload"])
    if run_mode == "Webcam":
        cam_src = st.number_input("Webcam index", min_value=0, max_value=10, value=0)
    else:
        upload_file = st.file_uploader("Upload file (video/image)", type=["mp4", "mov", "avi", "jpg", "png", "jpeg"])

    st.markdown("---")
    st.header("Tuning")
    conf = st.slider("Confidence threshold", 0.0, 1.0, 0.35, 0.01)
    iou = st.slider("NMS IoU threshold", 0.0, 1.0, 0.45, 0.01)
    imgsz = st.slider("Image size (px)", 320, 1280, 640, step=32)
    max_det = st.number_input("Max detections", min_value=1, max_value=1000, value=100)
    enable_tracking = st.checkbox("Enable tracking (ID persist)", value=False)
    show_masks = st.checkbox("Show segmentation masks (if model supports)", value=True)

    st.markdown("---")
    st.header("Advanced")
    save_output = st.checkbox("Save output video", value=False)
    out_path = st.text_input("Output path", value="output.mp4")
    start_btn = st.button("Load model & Start")

# --- Layout ---
col1, col2 = st.columns([3, 1])  # left for video, right for label toggles
frame_window = col1.empty()
label_window = col2.empty()

# --- Simple Tracker ---
class SimpleMatcher:
    def __init__(self, max_lost=30):
        self.next_id = 0
        self.objects = {}
        self.lost = {}
        self.max_lost = max_lost

    def update(self, detections):
        centers = [((x1 + x2) / 2, (y1 + y2) / 2) for x1, y1, x2, y2 in detections]
        assigned, new_objects = set(), {}
        for cid, cpos in self.objects.items():
            best_i, best_dist = None, 1e9
            for i, center in enumerate(centers):
                if i in assigned:
                    continue
                d = (center[0] - cpos[0]) ** 2 + (center[1] - cpos[1]) ** 2
                if d < best_dist:
                    best_dist = d
                    best_i = i
            if best_i is not None and best_dist < (50 ** 2):
                new_objects[cid] = centers[best_i]
                assigned.add(best_i)
            else:
                self.lost[cid] = self.lost.get(cid, 0) + 1
        for cid in list(self.lost.keys()):
            if self.lost[cid] > self.max_lost:
                self.lost.pop(cid)
                self.objects.pop(cid, None)
        for i, center in enumerate(centers):
            if i in assigned:
                continue
            nid = self.next_id
            self.next_id += 1
            new_objects[nid] = center
            self.lost[nid] = 0
        self.objects = new_objects
        return self.objects


# --- Utility ---
def bgr_to_pil(bgr):
    return Image.fromarray(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))


# --- Main Runner ---
if start_btn:
    if not model_path:
        st.error("Please provide a valid model path")
        st.stop()

    try:
        model = safe_load_yolo(model_path)
    except Exception as e:
        st.exception(e)
        st.stop()

    model.to(device)
    if use_half and device != torch.device("cpu"):
        model.model.half()

    cap = None
    if run_mode == "Webcam":
        cap = cv2.VideoCapture(int(cam_src))
    elif run_mode == "Video file" and upload_file is not None:
        tpath = "temp_input_video.mp4"
        with open(tpath, "wb") as f:
            f.write(upload_file.getbuffer())
        cap = cv2.VideoCapture(tpath)
    elif run_mode == "Image upload":
        if upload_file is None:
            st.warning("Upload an image first.")
            st.stop()
        file_bytes = np.asarray(bytearray(upload_file.read()), dtype=np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        results = model.predict(img, conf=conf, iou=iou, imgsz=imgsz)
        frame_window.image(bgr_to_pil(results[0].plot()), use_column_width=True)
        st.stop()
    else:
        st.warning("Please select webcam or upload a file.")
        st.stop()

    # --- Setup ---
    matcher = SimpleMatcher() if enable_tracking else None
    fps_smooth, prev = 0.0, time.time()

    all_labels = model.names  # YOLO labels dict
    st.sidebar.success("Model loaded. Streaming...")

    writer = None
    if save_output:
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        fps = cap.get(cv2.CAP_PROP_FPS) or 25
        width, height = int(cap.get(3)), int(cap.get(4))
        writer = cv2.VideoWriter(out_path, fourcc, fps, (width, height))

    # --- Realtime Loop ---
    try:
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            results = model.predict(frame, conf=conf, iou=iou, imgsz=imgsz, max_det=max_det)
            res = results[0]
            annotated = res.plot()

            # --- Tracking IDs (optional) ---
            if enable_tracking and hasattr(res, "boxes"):
                boxes = res.boxes.xyxy.cpu().numpy()
                ids = matcher.update([(x1, y1, x2, y2) for x1, y1, x2, y2 in boxes])
                for oid, (cx, cy) in ids.items():
                    cv2.putText(annotated, f"ID:{oid}", (int(cx), int(cy) - 5),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

            # --- Label Dashboard ---
            detected_labels = set()
            if hasattr(res, "boxes") and len(res.boxes) > 0:
                for cls_idx in res.boxes.cls.cpu().numpy().astype(int):
                    detected_labels.add(all_labels.get(cls_idx, f"cls{cls_idx}"))

            label_html = "<div style='font-family:Inter; padding:10px;'>"
            for cls_id, name in all_labels.items():
                color = "#16A34A" if name in detected_labels else "#B91C1C"
                label_html += f"""
                <div style='display:flex; align-items:center; margin:4px 0;'>
                    <div style='width:15px; height:15px; border-radius:3px; background:{color}; margin-right:8px;'></div>
                    <span style='font-size:14px; color:#333;'>{name}</span>
                </div>
                """
            label_html += "</div>"
            label_window.markdown(label_html, unsafe_allow_html=True)

            # --- FPS and display ---
            now = time.time()
            fps = 1.0 / (now - prev) if (now - prev) > 0 else 0
            fps_smooth = fps_smooth * 0.8 + fps * 0.2 if fps_smooth else fps
            prev = now

            frame_window.image(bgr_to_pil(annotated), use_column_width=True)

            if writer is not None:
                writer.write(annotated)

            time.sleep(0.01 if run_mode == "Webcam" else 0.001)

    except Exception as e:
        st.exception(e)
    finally:
        if cap is not None:
            cap.release()
        if writer is not None:
            writer.release()
        st.sidebar.info("Stream finished.")
