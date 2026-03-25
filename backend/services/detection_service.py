"""YOLO-based object and weapon detection service."""
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
    Run YOLO detection on a frame.
    
    Returns:
        list of dict: Each dict has keys: bbox, confidence, class, label
    """
    model = get_model()
    if model is None:
        return []

    try:
        # Pushing imgsz back to 320px to prioritize snappy detection speed while maintaining 25% confidence.
        # This allows the AI to run 3+ times per second on standard laptop CPUs.
        results = model(frame, conf=0.25, imgsz=320, device='cpu', verbose=False)
        detections = []

        # COCO class names mapping
        class_names = {
            0: "person", 43: "knife", 76: "scissors",
            39: "bottle", 41: "cup", 67: "cell phone"
        }

        for r in results:
            if r.boxes is None or len(r.boxes) == 0:
                continue
            for box in r.boxes.data:
                values = box.tolist()
                if len(values) < 6:
                    continue
                x1, y1, x2, y2, conf, cls = values[:6]
                cls_int = int(cls)

                # Filter to relevant classes
                if cls_int not in Config.DETECTION_CLASSES:
                    continue

                # Require higher confidence (e.g. 0.45) for persons, but allow 0.25 for weapons
                if cls_int == 0 and conf < Config.YOLO_CONFIDENCE:
                    continue

                label = class_names.get(cls_int, f"class_{cls_int}")
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
