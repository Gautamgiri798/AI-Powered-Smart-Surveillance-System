"""Event/alert routes."""
from flask import Blueprint, request, jsonify
from utils.auth_utils import token_required
from services.alert_service import (
    get_recent_events, get_stats,
    ack_event, clear_events, delete_event
)

event_bp = Blueprint("event", __name__)


@event_bp.route("/api/events", methods=["GET"])
@token_required
def list_events(current_user):
    """Get recent events with optional filters."""
    limit = request.args.get("limit", 50, type=int)
    camera_id = request.args.get("camera_id")
    severity = request.args.get("severity")

    events = get_recent_events(
        limit=min(limit, 200),
        camera_id=camera_id,
        severity=severity
    )
    return jsonify({"events": events, "count": len(events)})


@event_bp.route("/api/events/stats", methods=["GET"])
@token_required
def event_stats(current_user):
    """Get event statistics."""
    stats = get_stats()
    return jsonify(stats)


@event_bp.route("/api/events/<event_id>/acknowledge", methods=["POST"])
@token_required
def acknowledge(current_user, event_id):
    """Acknowledge an event."""
    success = ack_event(event_id)
    if success:
        return jsonify({"message": "Event acknowledged"})
    else:
        return jsonify({"error": "Failed to acknowledge event"}), 400


@event_bp.route("/api/events/clear", methods=["DELETE"])
@token_required
def clear(current_user):
    """Clear all events (admin only)."""
    if current_user.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    count = clear_events()
    return jsonify({"message": f"Cleared {count} events"})


@event_bp.route("/api/events/<event_id>", methods=["DELETE"])
@token_required
def delete(current_user, event_id):
    """Delete a specific event."""
    success = delete_event(event_id)
    if success:
        return jsonify({"message": "Event deleted"})
    else:
        return jsonify({"error": "Failed to delete event"}), 400
