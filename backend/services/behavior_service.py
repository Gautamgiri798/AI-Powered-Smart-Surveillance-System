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

    persons = [d for d in detections if d.get("class") == 0]
    weapons = [d for d in detections if d.get("is_weapon")]

    # Rule 1: Weapon + Person = HIGH ALERT
    if weapons and persons:
        for weapon in weapons:
            behaviors.append({
                "type": "weapon_with_person",
                "severity": "critical",
                "description": f"⚠️ {weapon['label'].upper()} detected near person(s)!",
                "track_id": weapon.get("track_id"),
                "confidence": weapon["confidence"]
            })

    # Rule 2: Weapon alone = HIGH
    elif weapons:
        for weapon in weapons:
            behaviors.append({
                "type": "weapon_detected",
                "severity": "high",
                "description": f"🔪 {weapon['label'].upper()} detected in frame",
                "track_id": weapon.get("track_id"),
                "confidence": weapon["confidence"]
            })

    # Rule 3: Running person (high velocity)
    for person in persons:
        track_id = person.get("track_id")
        if track_id is not None:
            velocity = tracker.get_velocity(track_id)
            if velocity > Config.HIGH_VELOCITY_THRESHOLD:
                behaviors.append({
                    "type": "running_person",
                    "severity": "medium",
                    "description": f"🏃 Person (ID: {track_id}) running — velocity: {velocity:.1f} px/s",
                    "track_id": track_id,
                    "velocity": velocity
                })

    # Rule 4: Loitering
    for person in persons:
        track_id = person.get("track_id")
        if track_id is not None:
            stationary_time = tracker.get_stationary_time(track_id)
            if stationary_time > Config.LOITERING_THRESHOLD_SEC:
                behaviors.append({
                    "type": "loitering",
                    "severity": "low",
                    "description": f"🕐 Person (ID: {track_id}) loitering for {stationary_time:.0f}s",
                    "track_id": track_id,
                    "stationary_time": stationary_time
                })

    # Rule 5: Crowd detection (many persons)
    if len(persons) >= 5:
        behaviors.append({
            "type": "crowd_detected",
            "severity": "medium",
            "description": f"👥 Crowd detected — {len(persons)} persons in frame",
            "count": len(persons)
        })

    return behaviors
