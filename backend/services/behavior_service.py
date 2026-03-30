"""Suspicious behavior analysis service."""
from config import Config
from services.tracking_service import get_tracker


def analyze_behavior(camera_id: str, detections: list) -> list:
    """
    Advanced behavioral analysis suite for SentinelVision.
    Provides Person, Weapon, Loitering, Running, Fall, Intrusion, and Crowd monitoring.
    """
    tracker = get_tracker(camera_id)
    behaviors = []

    persons = [d for d in detections if d.get("class") == 0]
    weapons = [d for d in detections if d.get("is_weapon")]
    phones = [d for d in detections if d.get("class") == 67] # Cell phone

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
        conf = person.get("confidence", 0.0)
        
        if not bbox or not center: continue
        
        # A. SMARTPHONE USAGE (Object-Context Matching)
        for phone in phones:
            p_c = phone.get("center")
            if p_c and bbox[0] <= p_c[0] <= bbox[2] and bbox[1] <= p_c[1] <= bbox[3]:
                behaviors.append({
                    "type": "phoning",
                    "severity": "info",
                    "description": "📱 PHONING: Subject is actively using a cell phone.",
                    "track_id": track_id,
                    "confidence": max(conf, phone.get("confidence", 0))
                })
                break

        if track_id is not None:
            # C. Running Detection
            velocity = tracker.get_velocity(track_id)
            if velocity > Config.HIGH_VELOCITY_THRESHOLD:
                behaviors.append({
                    "type": "running",
                    "severity": "medium",
                    "description": f"🏃 RUNNING: Person (ID: {track_id}) moving at high velocity",
                    "track_id": track_id,
                    "confidence": conf
                })

            # D. Loitering Detection
            stationary_time = tracker.get_stationary_time(track_id)
            if stationary_time > Config.LOITERING_THRESHOLD_SEC:
                behaviors.append({
                    "type": "loitering",
                    "severity": "low",
                    "description": f"🕐 LOITERING: Person (ID: {track_id}) stationary for {stationary_time:.0f}s",
                    "track_id": track_id,
                    "confidence": conf
                })

            # --- SENTRY-LSTM: Advanced Temporal Sequence Analysis ---
            from services.sequence_service import sentry_lstm
            temporal_data = {
                "track_id": track_id,
                "bbox": bbox,
                "center": center,
                "velocity": velocity,
                "confidence": conf,
                "keypoints": person.get("keypoints")
            }
            temporal_anomalies = sentry_lstm.update_and_analyze(camera_id, track_id, temporal_data)
            for anomaly in temporal_anomalies:
                anomaly["track_id"] = track_id
                anomaly["confidence"] = conf
                behaviors.append(anomaly)

    # CALL MULTI-SUBJECT ANALYSIS (Following, Tailgating)
    if len(persons) >= 2:
        from services.sequence_service import sentry_lstm
        # Create map for easier analysis
        p_map = {p["track_id"]: p for p in persons if p.get("track_id") is not None}
        interaction_anomalies = sentry_lstm.analyze_multi_subject(camera_id, p_map)
        for interaction in interaction_anomalies:
            interaction["confidence"] = 0.85 # Heuristic confidence
            behaviors.append(interaction)

    # 3. CROWD DENSITY (Global)
    p_count = len(persons)
    if p_count >= Config.CROWD_DENSITY_LIMIT:
        severity = "medium"
        if p_count >= 10: severity = "high"
        if p_count >= 20: severity = "critical"
        
        import numpy as np
        avg_conf = np.mean([p.get("confidence", 0) for p in persons]) if persons else 0
        behaviors.append({
            "type": "crowd_density",
            "severity": severity,
            "description": f"👥 CROWD: High density detected — {p_count} persons in frame",
            "count": p_count,
            "confidence": avg_conf
        })

    # 4. VIOLENT CONFLICT / FIGHT DETECTION (Multi-subject interaction)
    import math
    if p_count >= 2:
        for i in range(p_count):
            for j in range(i + 1, p_count):
                p1, p2 = persons[i], persons[j]
                c1, c2 = p1.get("center"), p2.get("center")
                id1, id2 = p1.get("track_id"), p2.get("track_id")
                
                if not c1 or not c2 or id1 is None or id2 is None: continue
                
                # Calculate pixel distance between the two subjects
                dist = math.sqrt((c1[0] - c2[0])**2 + (c1[1] - c2[1])**2)
                
                # Fetch velocities for both
                v1 = tracker.get_velocity(id1)
                v2 = tracker.get_velocity(id2)
                
                # FIGHT LOGIC: If two people are dangerously close (< 150px) AND both are moving fast
                if dist < 150 and (v1 > 80 or v2 > 80) and (min(v1, v2) > 30):
                    fight_conf = (p1.get("confidence", 0) + p2.get("confidence", 0)) / 2
                    behaviors.append({
                        "type": "fight_detected",
                        "severity": "critical",
                        "description": f"🥊 FIGHT DETECTED: Violent physical conflict between subjects {id1} and {id2}!",
                        "track_id": id1,
                        "confidence": fight_conf
                    })

    # 5. SUSPICIOUS OBJECT / ABANDONED PACKAGE DETECTION
    bags = [d for d in detections if d.get("class") in [24, 26, 28]]  # Backpack, Handbag, Suitcase
    for bag in bags:
        bag_id = bag.get("track_id")
        bag_center = bag.get("center")
        bag_conf = bag.get("confidence", 0.0)
        if bag_id is not None and bag_center:
            stationary_time = tracker.get_stationary_time(bag_id)
            if stationary_time > 15: # 15 seconds stationary
                # Check if any person is in proximity
                is_attended = False
                for p in persons:
                    p_c = p.get("center")
                    if p_c:
                        dist = math.sqrt((bag_center[0] - p_c[0])**2 + (bag_center[1] - p_c[1])**2)
                        if dist < 250: # Person is within ~250 pixels
                            is_attended = True
                            break
                
                if not is_attended:
                    behaviors.append({
                        "type": "abandoned_object",
                        "severity": "critical",
                        "description": f"🎒 SUSPICIOUS PACKAGE: Unattended {bag.get('label')} detected for {stationary_time:.0f}s!",
                        "track_id": bag_id,
                        "confidence": bag_conf
                    })

    # 6. CONTEXTUAL / ENVIRONMENTAL (Night Activity)
    import datetime
    hour = datetime.datetime.now().hour
    if hour >= 22 or hour <= 5:
        behaviors.append({
            "type": "night_activity",
            "severity": "low",
            "description": "🌙 CONTEXT: System is active during high-risk late-night hours.",
            "confidence": 1.0
        })

    return behaviors
