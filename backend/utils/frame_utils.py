import cv2
import base64
import numpy as np
from config import Config

def resize_frame(frame, width=None, height=None):
    """Resize frame while maintaining aspect ratio or forced dimensions."""
    if width is None:
        width = Config.FRAME_WIDTH
    if height is None:
        height = Config.FRAME_HEIGHT
    return cv2.resize(frame, (width, height))

def encode_frame_to_base64(frame) -> str:
    """Encode an OpenCV frame to a high-performance base64 JPEG string (Optimized for zero-lag)."""
    _, buffer = cv2.imencode('.jpg', frame, [cv2.IMWRITE_JPEG_QUALITY, 50])
    return base64.b64encode(buffer).decode('utf-8')

def draw_detections(frame, detections, orig_size=None, status_map=None):
    """Professional Minimalist HUD (Clean Bounding Boxes with State Monitoring)."""
    h_now, w_now = frame.shape[:2]
    sw, sh = (w_now / orig_size[0], h_now / orig_size[1]) if orig_size else (1.0, 1.0)
    
    for det in detections:
        bbox = det["bbox"]
        x1, y1, x2, y2 = int(bbox[0]*sw), int(bbox[1]*sh), int(bbox[2]*sw), int(bbox[3]*sh)
        conf, cls = det["confidence"], det["class"]
        raw_label = det.get("label", "TARGET").upper()

        # Persistent Identifier & Action Mapping (PERSON_1 // RUNNING)
        track_id = det.get("track_id")
        if track_id is not None:
            # Append action status if available in mission telemetry
            status = status_map.get(track_id, "MONITORING") if status_map else "ACTIVE"
            label = f"{raw_label}_{track_id} // {status}"
        else:
            label = raw_label

        # Elite Palette: Emerald=Safe, Deep-Red=Weapon, Sky-Blue=System
        color = (34, 197, 94) if cls == 0 else (0, 0, 255) if cls in Config.WEAPON_CLASSES else (0, 215, 255)
        
        # 1. Professional Bounding Box (Clean thickness)
        cv2.rectangle(frame, (x1, y1), (x2, y2), color, 1)

        # 2. Advanced HUD Label (Clean & Professional)
        tag = f"{label} // {int(conf*100)}%"
        font = cv2.FONT_HERSHEY_SIMPLEX
        scale = 0.4
        (tw, th), _ = cv2.getTextSize(tag, font, scale, 1)
        
        # Consistent HUD Backdrop
        cv2.rectangle(frame, (x1, y1 - th - 8), (x1 + tw + 8, y1), color, -1)
        # White text for high contrast
        cv2.putText(frame, tag, (x1 + 4, y1 - 6), font, scale, (255, 255, 255), 1, cv2.LINE_AA)

    return frame
