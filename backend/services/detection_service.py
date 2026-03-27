import cv2
import numpy as np
from config import Config

# Lazy-load model to avoid import delays
_model = None

def get_model():
    """Lazy-load YOLO model."""
    global _model
    if _model is None:
        try:
            from ultralytics import YOLO
            _model = YOLO(Config.YOLO_MODEL)
            print(f"[DETECTION] YOLO model loaded: {Config.YOLO_MODEL}")
        except Exception as e:
            print(f"[DETECTION] Failed to load YOLO model: {e}")
            _model = None
    return _model

def detect_objects(frame):
    """
    Run YOLO detection on a frame with advanced image preprocessing.
    Returns: list of dict with bbox, confidence, class, label, keypoints
    """
    model = get_model()
    if model is None: return []

    try:
        # Preprocessing: Apply CLAHE for better clarity
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        enhanced_frame = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        results = model(enhanced_frame, conf=0.25, imgsz=640, device='cpu', verbose=False)
        detections = []

        for r in results:
            if r.boxes is not None:
                # Keypoints objects has a .data property
                kp_data = r.keypoints.data if hasattr(r, 'keypoints') and r.keypoints is not None else None
                
                for i, box in enumerate(r.boxes.data):
                    values = box.tolist()
                    if len(values) < 6: continue
                    x1, y1, x2, y2, conf, cls = values[:6]
                    cls_int = int(cls)

                    if cls_int not in Config.DETECTION_CLASSES: continue
                    threshold = 0.25 if cls_int in Config.WEAPON_CLASSES else 0.45
                    if conf < threshold: continue

                    label = model.names.get(cls_int, f"class_{cls_int}")
                    is_weapon = cls_int in Config.WEAPON_CLASSES

                    # Safe keypoint extraction
                    keypoints = None
                    if cls_int == 0 and kp_data is not None:
                        try:
                            if i < len(kp_data):
                                keypoints = kp_data[i].tolist()
                        except:
                            keypoints = None

                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "confidence": round(conf, 3),
                        "class": cls_int,
                        "label": label,
                        "is_weapon": is_weapon,
                        "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                        "keypoints": keypoints
                    })

        return detections
    except Exception as e:
        print(f"[DETECTION] Error during detection: {e}")
        return []

def get_detection_summary(detections):
    persons = sum(1 for d in detections if d["class"] == 0)
    weapons = sum(1 for d in detections if d["is_weapon"])
    return {
        "total": len(detections),
        "persons": persons,
        "weapons": weapons,
        "has_threat": weapons > 0
    }
