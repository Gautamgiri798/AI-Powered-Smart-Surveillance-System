"""Frame processing utilities."""
import cv2
import base64
import numpy as np
from config import Config


def encode_frame_to_base64(frame) -> str:
    """Encode an OpenCV frame to a high-performance base64 JPEG string (Optimized for zero-lag)."""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
    return base64.b64encode(buffer).decode('utf-8')


def decode_base64_to_frame(base64_str: str):
    """Decode a base64 string back to an OpenCV frame."""
    img_data = base64.b64decode(base64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)


def resize_frame(frame, width=None, height=None):
    """Resize frame maintaining aspect ratio or to exact dimensions."""
    if width is None:
        width = Config.FRAME_WIDTH
    if height is None:
        height = Config.FRAME_HEIGHT
    return cv2.resize(frame, (width, height))


def draw_detections(frame, detections, class_names=None):
    """Draw bounding boxes and labels on frame."""
    default_names = {0: "Person", 43: "Knife", 76: "Scissors"}
    if class_names is None:
        class_names = default_names

    for det in detections:
        bbox = det["bbox"]
        x1, y1, x2, y2 = int(bbox[0]), int(bbox[1]), int(bbox[2]), int(bbox[3])
        conf = det["confidence"]
        cls = det["class"]
        # Use the label provided by the detection service (which is COCO-wide now)
        label = det.get("label", f"Class {cls}").capitalize()

        # Color coding: red for weapons, green for persons
        if cls in Config.WEAPON_CLASSES:
            color = (0, 0, 255)  # Red for weapons
        elif cls == 0:
            color = (0, 255, 0)  # Green for persons
        else:
            color = (255, 165, 0)  # Orange for others

        # Draw bounding box
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

        # Draw label background
        text = f"{label} {conf:.2f}"
        (text_w, text_h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(frame, (x1, y1 - text_h - 10), (x1 + text_w, y1), color, -1)

        # Draw label text
        cv2.putText(frame, text, (x1, y1 - 5),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)

    return frame
