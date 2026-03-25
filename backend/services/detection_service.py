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
    
    Returns:
        list of dict: Each dict has keys: bbox, confidence, class, label
    """
    model = get_model()
    if model is None:
        return []

    try:
        # ADVANCED PREPROCESSING: Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        # This makes the image much "clearer" and optimizes lighting for the AI.
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        enhanced_frame = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # Increase imgsz to 640 for maximum accuracy on HD camera frames.
        # This provides the "perfect" detection requested by the user.
        results = model(enhanced_frame, conf=0.25, imgsz=640, device='cpu', verbose=False)
        detections = []

        # COCO class names mapping (No longer needed since we use model.names)
        
        # Process detections
        for r in results:
            if r.boxes is not None:
                for box in r.boxes.data:
                    values = box.tolist()
                    if len(values) < 6: continue
                    x1, y1, x2, y2, conf, cls = values[:6]
                    cls_int = int(cls)

                    # Filter based on Config (Detect everything)
                    if cls_int not in Config.DETECTION_CLASSES:
                        continue

                    # Refined confidence logic for high-stakes surveillance
                    # 0.25 for weapons (safety first), 0.45 for general objects to avoid false positives.
                    threshold = 0.25 if cls_int in Config.WEAPON_CLASSES else 0.45
                    if conf < threshold:
                        continue

                    # Get dynamic label from the YOLO model itself
                    label = model.names.get(cls_int, f"class_{cls_int}")
                    is_weapon = cls_int in Config.WEAPON_CLASSES

                    if is_weapon:
                        print(f"[VERBOSE] 🔪 WEAPON SEEN: {label} (conf: {round(conf, 3)})")

                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "confidence": round(conf, 3),
                        "class": cls_int,
                        "label": label,
                        "is_weapon": is_weapon,
                        "center": [(x1 + x2) / 2, (y1 + y2) / 2]
                    })

        return detections

    except Exception as e:
        print(f"[DETECTION] Error during detection: {e}")
        return []


def get_detection_summary(detections):
    """Get a summary of detections."""
    persons = sum(1 for d in detections if d["class"] == 0)
    weapons = sum(1 for d in detections if d["is_weapon"])
    return {
        "total": len(detections),
        "persons": persons,
        "weapons": weapons,
        "has_threat": weapons > 0
    }
