"""Suspicious behavior analysis service."""
from config import Config
from services.tracking_service import get_tracker


def analyze_behavior(camera_id: str, detections: list) -> list:
    """
    Analyze detections for suspicious behavior.

    Returns:
        list of behavior alerts (dict with type, severity, description, track_id)
    """
    tracker = get_tracker(camera_id)
    behaviors = []

def analyze_behavior(camera_id: str, detections: list) -> list:
    """
    Advanced behavioral analysis suite for SentinelVision.
    Provides Person, Weapon, Loitering, Running, Fall, Intrusion, and Crowd monitoring.
    """
    tracker = get_tracker(camera_id)
    behaviors = []

    persons = [d for d in detections if d.get("class") == 0]
    weapons = [d for d in detections if d.get("is_weapon")]

    # 1. WEAPON THREATS (Priority 1)
    if weapons:
        for weapon in weapons:
            severity = "critical" if persons else "high"
            prefix = "⚠️ THREAT:" if persons else "🔪 WEAPON:"
            behaviors.append({
                "type": "weapon_threat",
                "severity": severity,
                "description": f"{prefix} {weapon['label'].upper()} detected!",
                "track_id": weapon.get("track_id")
            })

    # 2. PERSON-LEVEL BEHAVIORS
    for person in persons:
        track_id = person.get("track_id")
        bbox = person.get("bbox") # [x1, y1, x2, y2]
        center = person.get("center") # [cx, cy]
        
        if not bbox or not center: continue
        
        # A. Stable Fall Detection (Aspect Ratio + Temporal)
        w = bbox[2] - bbox[0]
        h = bbox[3] - bbox[1]
        
        # We increase the ratio to 2.2 for conservative detection (prevents alerts when sitting)
        # We also ensure the subject is not positioned too high in the frame (laptop cam false positives)
        if h > 0 and (w / h) > 2.2 and center[1] > (Config.FRAME_HEIGHT * 0.4):
            # We flag it, but the SentryLSTM (SequenceBrain) will verify the rapid collapse
            behaviors.append({
                "type": "fall_detected",
                "severity": "high",
                "description": f"🚨 POTENTIAL FALL: Person (ID: {track_id}) posture anomaly detected.",
                "track_id": track_id
            })

        # B. Improved Intrusion Detection
        # Check if the person is NOT already a main subject (too big) and bottom (y2) in zone
        # This prevents alerts when user is simply in front of the camera
        person_area = (w * h) / (Config.FRAME_WIDTH * Config.FRAME_HEIGHT)
        norm_y_bottom = bbox[3] / Config.FRAME_HEIGHT
        
        if norm_y_bottom > Config.RESTRICTED_ZONE_Y and person_area < 0.3:
            behaviors.append({
                "type": "intrusion",
                "severity": "critical",
                "description": f"⛔ INTRUSION: Subject (ID: {track_id}) breached Restricted Security Zone!",
                "track_id": track_id
            })

        if track_id is not None:
            # C. Running Detection
            velocity = tracker.get_velocity(track_id)
            if velocity > Config.HIGH_VELOCITY_THRESHOLD:
                behaviors.append({
                    "type": "running",
                    "severity": "medium",
                    "description": f"🏃 RUNNING: Person (ID: {track_id}) moving at high velocity",
                    "track_id": track_id
                })

            # D. Loitering Detection
            stationary_time = tracker.get_stationary_time(track_id)
            if stationary_time > Config.LOITERING_THRESHOLD_SEC:
                behaviors.append({
                    "type": "loitering",
                    "severity": "low",
                    "description": f"🕐 LOITERING: Person (ID: {track_id}) stationary for {stationary_time:.0f}s",
                    "track_id": track_id
                })

            # --- SENTRY-LSTM: Advanced Temporal Sequence Analysis ---
            from services.sequence_service import sentry_lstm
            temporal_data = {
                "bbox": bbox,
                "center": center,
                "velocity": velocity,
                "keypoints": person.get("keypoints")
            }
            temporal_anomalies = sentry_lstm.update_and_analyze(camera_id, track_id, temporal_data)
            for anomaly in temporal_anomalies:
                anomaly["track_id"] = track_id
                behaviors.append(anomaly)

    # 3. CROWD DENSITY (Global)
    p_count = len(persons)
    if p_count >= Config.CROWD_DENSITY_LIMIT:
        severity = "medium"
        if p_count >= 10: severity = "high"
        if p_count >= 20: severity = "critical"
        
        behaviors.append({
            "type": "crowd_density",
            "severity": severity,
            "description": f"👥 CROWD: High density detected — {p_count} persons in frame",
            "count": p_count
        })

    return behaviors
