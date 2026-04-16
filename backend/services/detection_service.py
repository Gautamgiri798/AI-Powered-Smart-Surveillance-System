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
            _model = YOLO("yolov8s_openvino_model", task="detect")
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
            _pose_model = YOLO("yolov8s-pose_openvino_model", task="pose")
            print("[POSE] Human Action Engine loaded: yolov8s-pose_openvino")
        except Exception as e:
            print(f"[POSE] Failed to load pose engine: {e}")
            _pose_model = None
    return _pose_model


def _compute_iou(boxA, boxB):
    """Compute Intersection over Union between two boxes [x1,y1,x2,y2]."""
    xA = max(boxA[0], boxB[0])
    yA = max(boxA[1], boxB[1])
    xB = min(boxA[2], boxB[2])
    yB = min(boxA[3], boxB[3])
    
    inter = max(0, xB - xA) * max(0, yB - yA)
    if inter == 0:
        return 0.0
    
    areaA = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1])
    areaB = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1])
    
    return inter / (areaA + areaB - inter)


def _nms_per_class(detections, iou_threshold=0.45):
    """
    Apply Non-Maximum Suppression per class to remove duplicate detections.
    This is critical for preventing the same person being detected twice.
    """
    if len(detections) <= 1:
        return detections
    
    # Group by class
    by_class = {}
    for d in detections:
        cls = d["class"]
        if cls not in by_class:
            by_class[cls] = []
        by_class[cls].append(d)
    
    result = []
    for cls, dets in by_class.items():
        # Sort by confidence, highest first
        dets.sort(key=lambda x: x["confidence"], reverse=True)
        
        keep = []
        while dets:
            best = dets.pop(0)
            keep.append(best)
            
            # Remove detections that overlap too much with the best one
            remaining = []
            for d in dets:
                if _compute_iou(best["bbox"], d["bbox"]) < iou_threshold:
                    remaining.append(d)
            dets = remaining
        
        result.extend(keep)
    
    return result


def detect_objects(frame):
    """
    Dual-Engine AI Pipeline with strict NMS to prevent duplicate detections.
    1. Runs Generic Detection (Weapons, Objects, etc.)
    2. Runs Pose Estimation (Skeletal actions, Posture)
    3. Applies per-class NMS to remove overlapping duplicates
    """
    model = get_model()
    pose_model = get_pose_model()
    if model is None: return []

    try:
        # Preprocessing: Apply mild CLAHE for clarity
        lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8, 8))
        cl = clahe.apply(l)
        enhanced_lab = cv2.merge((cl, a, b))
        enhanced_frame = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)

        # 1. Detection Pass — higher confidence to reduce false positives
        # Detection Pass — use original frame for maximum model fidelity
        results = model(
            frame, 
            conf=Config.YOLO_CONFIDENCE, 
            iou=0.45, 
            imgsz=640, 
            device='cpu', 
            verbose=False,
            classes=Config.DETECTION_CLASSES
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
                    
                    # Class-specific sensitivity matrices to prevent false positives for common misidentifications
                    # Cell phones (67) often ghost on bottles/remotes, so we require higher confidence.
                    if cls_int == 67:
                        threshold = 0.65
                    elif cls_int in Config.WEAPON_CLASSES:
                        threshold = 0.55 # Balanced for security vs noise
                    else:
                        threshold = Config.YOLO_CONFIDENCE
                        
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

        # 2. Apply strict NMS to eliminate duplicate detections of same person
        # Aggressive threshold (0.25) to collapse near-identical bounding boxes
        detections = _nms_per_class(detections, iou_threshold=0.25)

        # 3. Pose Pass — only if persons detected
        has_persons = any(d["class"] == 0 for d in detections)
        if has_persons and pose_model is not None:
            pose_results = pose_model(frame, conf=0.35, imgsz=640, verbose=False)
            for pr in pose_results:
                if pr.keypoints is not None:
                    for pose_kp_tensor in pr.keypoints.data:
                        kp_list = pose_kp_tensor.tolist()
                        valid_kp = [k for k in kp_list if k[2] > 0.3]
                        if not valid_kp: continue
                        pk_cx = sum(k[0] for k in valid_kp) / len(valid_kp)
                        pk_cy = sum(k[1] for k in valid_kp) / len(valid_kp)
                        
                        # Match to closest detected person
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
