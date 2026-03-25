"""Video streaming routes."""
from flask import Blueprint, jsonify
from utils.auth_utils import token_required
from services.video_service import get_active_cameras

stream_bp = Blueprint("stream", __name__)


@stream_bp.route("/api/streams", methods=["GET"])
@token_required
def list_active_streams(current_user):
    """Get list of active camera streams."""
    active = get_active_cameras()
    return jsonify({
        "active_streams": active,
        "count": len(active)
    })
