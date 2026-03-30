import cv2
import numpy as np
from config import Config

# Lazy-load models to avoid import delays
_model = None
_pose_model = None

def get_model():
    """Lazy-load YOLO detection model."""
    global _model
    if _model is None:
        try:
            from ultralytics import YOLO
            _model = YOLO("yolov8s_openvino_model")
            print("[DETECTION] Core Object Engine loaded: yolov8s_openvino")
        except Exception as e:
            print(f"[DETECTION] Failed to load core model: {e}")
            _model = None
    return _model

def get_pose_model():
    """Lazy-load YOLO pose model."""
    global _pose_model
    if _pose_model is None:
        try:
            from ultralytics import YOLO
            _pose_model = YOLO("yolov8s-pose_openvino_model")
            print("[POSE] Human Action Engine loaded: yolov8s-pose_openvino")
        except Exception as e:
            print(f"[POSE] Failed to load pose engine: {e}")
            _pose_model = None
    return _pose_model


def detect_objects(frame):
    """
    Advanced Dual-Engine AI Pipeline.
    1. Runs Generic Detection (Weapons, Luggage, Seats, etc.)
    2. Runs Pose Estimation (Skeletal actions, Waving, Posture)
    """
    model = get_model()
    pose_model = get_pose_model()
    if model is None: return []

    try:
        # Preprocessing: Apply milder CLAHE for clarity without noise-amplification
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        enhanced_frame = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # 1. Broad Environment Detection Pass
        results = model(
            enhanced_frame, 
            conf=0.35,
            imgsz=640, 
            device='cpu', 
            verbose=False
        )
        detections = []

        for r in results:
            if r.boxes is not None:
                for i, box in enumerate(r.boxes.data):
                    values = box.tolist()
                    if len(values) < 6: continue
                    x1, y1, x2, y2, conf, cls = values[:6]
                    cls_int = int(cls)

                    if cls_int not in Config.DETECTION_CLASSES: continue
                    threshold = 0.60 if cls_int in Config.WEAPON_CLASSES else Config.YOLO_CONFIDENCE
                    if conf < threshold: continue

                    label = model.names.get(cls_int, f"class_{cls_int}")
                    is_weapon = cls_int in Config.WEAPON_CLASSES
                    
                    detections.append({
                        "bbox": [x1, y1, x2, y2],
                        "confidence": round(conf, 3),
                        "class": cls_int,
                        "label": label,
                        "is_weapon": is_weapon,
                        "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                        "keypoints": None
                    })

        # 2. Precision Pose Pass (Run Pose model on any detected person)
        has_persons = any(d["class"] == 0 for d in detections)
        if has_persons and pose_model is not None:
            # We run a single full-frame pose pass for efficiency (it tracks all people)
            pose_results = pose_model(enhanced_frame, conf=0.4, verbose=False)
            for pr in pose_results:
                if pr.keypoints is not None:
                    # Match poses to existing person detections by center distance
                    for pose_kp_tensor in pr.keypoints.data:
                        kp_list = pose_kp_tensor.tolist()
                        # Calculate center of pose to match
                        valid_kp = [k for k in kp_list if k[2] > 0.3]
                        if not valid_kp: continue
                        pk_cx = sum(k[0] for k in valid_kp) / len(valid_kp)
                        pk_cy = sum(k[1] for k in valid_kp) / len(valid_kp)
                        
                        # Match to the closest detected person
                        best_person = None
                        min_dist = 60
                        for d in detections:
                            if d["class"] != 0: continue
                            dist = np.sqrt((d["center"][0]-pk_cx)**2 + (d["center"][1]-pk_cy)**2)
                            if dist < min_dist:
                                min_dist = dist
                                best_person = d
                        
                        if best_person:
                            best_person["keypoints"] = kp_list

        return detections
    except Exception as e:
        print(f"[DETECTION] Error during dual-pass AI: {e}")
        return []

def get_detection_summary(detections):
    persons = sum(1 for d in detections if int(d.get("class", -1)) == 0)
    weapons = sum(1 for d in detections if d.get("is_weapon", False))
    return {
        "total": len(detections),
        "persons": persons,
        "weapons": weapons,
        "has_threat": weapons > 0
    }

