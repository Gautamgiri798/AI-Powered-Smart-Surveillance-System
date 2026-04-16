"""Advanced Behavioral Intelligence Engine with temporal smoothing."""
from collections import defaultdict
from config import Config
from services.tracking_service import get_tracker

# ── Temporal smoothing: store recent activity labels per track ──
_activity_history = defaultdict(list)  # track_id -> list of recent labels
_HISTORY_LEN = 6  # number of frames to average over


def _smooth_activity(track_id: int, raw_label: str) -> str:
    """
    Smooth activity classification over the last N frames.
    Returns the most common label in the recent window.
    This eliminates single-frame noise (e.g. one "sitting" frame 
    while actually standing).
    """
    history = _activity_history[track_id]
    history.append(raw_label)
    if len(history) > _HISTORY_LEN:
        _activity_history[track_id] = history[-_HISTORY_LEN:]
        history = _activity_history[track_id]
    
    # Count occurrences and return the most frequent
    counts = {}
    for h in history:
        counts[h] = counts.get(h, 0) + 1
    return max(counts, key=counts.get)


def _classify_posture_from_keypoints(keypoints, bbox_height):
    """
    Use pose keypoints to determine posture (STANDING, SITTING, LYING).
    
    Keypoint indices (COCO):
      5=left_shoulder, 6=right_shoulder
      11=left_hip, 12=right_hip
      13=left_knee, 14=right_knee
      15=left_ankle, 16=right_ankle
    
    Strategy:
      - Compare vertical distances between body segments
      - If hip-knee-ankle chain is mostly vertical -> STANDING
      - If knees are close to hips vertically -> SITTING
      - If shoulders are close to hips vertically -> LYING
    """
    if not keypoints or len(keypoints) < 17:
        return None
    
    try:
        l_shoulder, r_shoulder = keypoints[5], keypoints[6]
        l_hip, r_hip = keypoints[11], keypoints[12]
        l_knee, r_knee = keypoints[13], keypoints[14]
        l_ankle, r_ankle = keypoints[15], keypoints[16]
        
        # Use keypoints with sufficient confidence (> 0.3)
        def valid(kp): return kp[2] > 0.3
        
        # Try to get shoulder, hip, knee, ankle Y positions
        # Average left and right if both are valid
        shoulder_y = None
        if valid(l_shoulder) and valid(r_shoulder):
            shoulder_y = (l_shoulder[1] + r_shoulder[1]) / 2
        elif valid(l_shoulder):
            shoulder_y = l_shoulder[1]
        elif valid(r_shoulder):
            shoulder_y = r_shoulder[1]
            
        hip_y = None
        if valid(l_hip) and valid(r_hip):
            hip_y = (l_hip[1] + r_hip[1]) / 2
        elif valid(l_hip):
            hip_y = l_hip[1]
        elif valid(r_hip):
            hip_y = r_hip[1]
            
        knee_y = None
        if valid(l_knee) and valid(r_knee):
            knee_y = (l_knee[1] + r_knee[1]) / 2
        elif valid(l_knee):
            knee_y = l_knee[1]
        elif valid(r_knee):
            knee_y = r_knee[1]
            
        ankle_y = None
        if valid(l_ankle) and valid(r_ankle):
            ankle_y = (l_ankle[1] + r_ankle[1]) / 2
        elif valid(l_ankle):
            ankle_y = l_ankle[1]
        elif valid(r_ankle):
            ankle_y = r_ankle[1]

        if shoulder_y is None or hip_y is None:
            return None
        
        # Normalize distances by bbox height for camera-angle independence
        torso_len = abs(hip_y - shoulder_y) / max(bbox_height, 1)
        
        # If we have knee data: check hip-to-knee vs knee-to-ankle ratios
        if knee_y is not None:
            hip_knee_dist = abs(knee_y - hip_y) / max(bbox_height, 1)
            
            # SITTING: knees are very close to hips vertically (legs bent)
            # Typical sitting: hip_knee_dist < 0.10 (legs folded under/forward)
            if hip_knee_dist < 0.10:
                return "SITTING"
            
            # STANDING: hip-to-knee takes a good fraction of body height
            # and torso is roughly vertical
            if hip_knee_dist > 0.15 and torso_len > 0.15:
                return "STANDING"
        
        # Fallback: if torso is very short relative to bbox, likely lying/sitting
        if torso_len < 0.12:
            return "LYING"
        
        # If torso is a reasonable fraction, person is likely standing
        if torso_len > 0.20:
            return "STANDING"
            
        return None  # Uncertain
        
    except (IndexError, TypeError):
        return None


def analyze_behavior(camera_id: str, detections: list) -> list:
    tracker = get_tracker(camera_id)
    behaviors = []
    status_map = {}

    persons = [d for d in detections if d.get("class") == 0]
    weapons = [d for d in detections if d.get("is_weapon")]
    phones = [d for d in detections if d.get("class") == 67]

    # --- 1. CRITICAL THREATS (FIRST) ---
    if weapons:
        for w in weapons:
            behaviors.append({
                "type": "weapon_threat", "severity": "critical", 
                "description": f"⚠️ CRITICAL: {w['label'].upper()} detected!",
                "track_id": w.get("track_id"), "confidence": w.get("confidence")
            })

    # --- 2. DYNAMIC ACTIONS & POSTURES ---
    for p in persons:
        tid = p.get("track_id")
        if tid is None: 
            continue
        bbox = p.get("bbox", [0, 0, 0, 0])
        bw = max(1, bbox[2] - bbox[0])
        bh = max(1, bbox[3] - bbox[1])
        aspect = bw / bh
        vel = tracker.get_velocity(tid)
        stay_time = tracker.get_stationary_time(tid)
        
        raw_status = "MONITORING"
        
        # Object holding logic - check if any non-person object is inside this person's bounding box
        held_objects = []
        is_phoning = False
        
        for obj in detections:
            # Skip persons
            if obj.get("class") == 0:
                continue
                
            oc = obj.get("center")
            if oc and bbox[0] <= oc[0] <= bbox[2] and bbox[1] <= oc[1] <= bbox[3]:
                # Object's center is inside person's bounding box -> they are holding it
                item_label = obj.get("label", "item")
                held_objects.append(item_label)
                
                if obj.get("class") == 67: # Phone class
                    is_phoning = True
        
        # Report generalized holding behavior (excluding phone, handled below)
        other_held = [o for o in held_objects if o.lower() != "cell phone"]
        if other_held:
            items_str = ", ".join(other_held)
            behaviors.append({
                "type": "holding_object", "severity": "info", "track_id": tid, 
                "description": f"Subject {tid} is holding: {items_str}."
            })
            
        if is_phoning:
            raw_status = "USING_PHONE"
            behaviors.append({
                "type": "phoning", "severity": "medium", "track_id": tid, 
                "description": f"📱 Subject {tid} is using a phone."
            })
        elif vel > Config.HIGH_VELOCITY_THRESHOLD:
            # High velocity = running
            raw_status = "RUNNING"
            behaviors.append({
                "type": "running", "severity": "medium", "track_id": tid, 
                "description": f"🏃 Subject {tid} is running (speed: {vel:.0f})."
            })
        elif vel > Config.HIGH_VELOCITY_THRESHOLD * 0.3:
            # Moderate velocity = walking (between 30-100% of run threshold)
            raw_status = "WALKING"
            behaviors.append({
                "type": "walking", "severity": "info", "track_id": tid, 
                "description": f"🚶 Subject {tid} is walking."
            })
        elif aspect > Config.FALL_THRESHOLD_RATIO and bh > 30:
            # Person is horizontal. Check if they are also near the ground to confirm a fall.
            # Using 0.6 as a threshold for the bottom of the bounding box
            # Normalized bottom coordinate
            bottom_y = bbox[3] / (Config.FRAME_HEIGHT if Config.FRAME_HEIGHT > 0 else 270)
            
            if bottom_y > 0.65:
                raw_status = "POSTURE_ANOMALY"
                behaviors.append({
                    "type": "posture_anomaly", "severity": "critical", "track_id": tid, 
                    "description": f"🚑 ALERT: Subject {tid} may have fallen (Ground Detection)."
                })
            else:
                # Wide box but not on ground? Likely reaching out/lounging
                raw_status = "SITTING" if aspect > 1.2 else "STANDING"
        else:
            # Determine posture from keypoints first, then fallback to aspect ratio
            kp_posture = _classify_posture_from_keypoints(
                p.get("keypoints"), bh
            )
            
            if kp_posture:
                raw_status = kp_posture
            else:
                # Aspect ratio fallback (less reliable)
                # Standing people are taller than wide (aspect < 0.7)
                # Sitting people are wider relative to height (aspect > 0.7)
                if aspect > 0.75:
                    raw_status = "SITTING"
                else:
                    raw_status = "STANDING"
            
            # Apply temporal smoothing to eliminate frame-to-frame noise
            smoothed_status = _smooth_activity(tid, raw_status)
            raw_status = smoothed_status
            
            behaviors.append({
                "type": raw_status.lower(), "severity": "info", "track_id": tid, 
                "description": f"Subject {tid} is {raw_status}."
            })

        # Loitering checks
        if stay_time > Config.LOITERING_THRESHOLD_SEC:
            if raw_status in ["STANDING", "WALKING"]:
                raw_status = "LOITERING"
                behaviors.append({
                    "type": "loitering", "severity": "low", "track_id": tid, 
                    "description": f"🕐 Subject {tid} has been stationary for {stay_time:.0f}s."
                })
        
        status_map[tid] = raw_status

    # --- 3. BASELINE OCCUPANCY (LAST) ---
    if persons:
        behaviors.append({
            "type": "person_detected", "severity": "info", 
            "description": f"👥 Monitoring {len(persons)} subject(s) in scene.",
            "count": len(persons)
        })

    behaviors.append({"type": "status_update", "status_map": status_map})
    return behaviors
