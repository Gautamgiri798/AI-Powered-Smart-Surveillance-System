"""Alert generation and rules engine service."""
from datetime import datetime, timezone
from models.db import create_event, get_events, get_event_stats, acknowledge_event as db_ack, clear_all_events


SEVERITY_LEVELS = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1,
    "info": 0
}


def create_alert(camera_id: str, behavior: dict, frame_url: str = None) -> dict:
    """
    Create and store an alert from a behavior event.

    Returns:
        dict: The alert document
    """
    severity = behavior.get("severity", "info")
    metadata = {
        "track_id": behavior.get("track_id"),
        "confidence": behavior.get("confidence"),
        "velocity": behavior.get("velocity"),
        "stationary_time": behavior.get("stationary_time"),
        "count": behavior.get("count"),
    }
    timestamp = datetime.now(timezone.utc).isoformat()

    try:
        row_id = create_event(
            camera_id=camera_id,
            event_type=behavior.get("type", "unknown"),
            severity=severity,
            severity_level=SEVERITY_LEVELS.get(severity, 0),
            description=behavior.get("description", ""),
            metadata_dict=metadata,
            frame_url=frame_url,
            timestamp=timestamp,
        )
        alert_id = str(row_id)
    except Exception as e:
        print(f"[ALERT] Failed to store alert: {e}")
        alert_id = None

    return {
        "_id": alert_id,
        "camera_id": camera_id,
        "event_type": behavior.get("type", "unknown"),
        "severity": severity,
        "severity_level": SEVERITY_LEVELS.get(severity, 0),
        "description": behavior.get("description", ""),
        "metadata": metadata,
        "frame_url": frame_url,
        "timestamp": timestamp,
        "acknowledged": False,
    }


def get_recent_events(limit=50, camera_id=None, severity=None):
    """Fetch recent events from database."""
    return get_events(limit=min(limit, 200), camera_id=camera_id, severity=severity)


def get_stats():
    """Get event statistics."""
    return get_event_stats()


def ack_event(event_id: str):
    """Mark an event as acknowledged."""
    return db_ack(event_id)


def clear_events():
    """Delete all events. Returns count deleted."""
    return clear_all_events()
