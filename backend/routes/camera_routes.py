"""Camera management routes."""
from flask import Blueprint, request, jsonify
from models.db import (
    get_all_cameras, get_camera, camera_exists,
    create_camera, update_camera, delete_camera as db_delete_camera
)
from utils.auth_utils import token_required
from services.video_service import (
    start_camera as svc_start_camera, stop_camera as svc_stop_camera,
    get_active_cameras
)

camera_bp = Blueprint("camera", __name__)


@camera_bp.route("/api/cameras", methods=["GET"])
@token_required
def list_cameras(current_user):
    """Get all cameras."""
    cameras = get_all_cameras()
    active = get_active_cameras()
    for cam in cameras:
        cam["is_streaming"] = cam["camera_id"] in active
        cam.pop("id", None)  # Remove internal row id
    return jsonify({"cameras": cameras})


@camera_bp.route("/api/cameras", methods=["POST"])
@token_required
def add_camera(current_user):
    """Add a new camera."""
    if current_user.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    required = ["camera_id", "name", "location"]
    for field in required:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    if camera_exists(data["camera_id"]):
        return jsonify({"error": "Camera ID already exists"}), 409

    create_camera(
        camera_id=data["camera_id"],
        name=data["name"],
        location=data["location"],
        rtsp_url=data.get("rtsp_url", ""),
        status="active",
        cam_type=data.get("type", "rtsp"),
    )

    return jsonify({"message": "Camera added"}), 201


@camera_bp.route("/api/cameras/<camera_id>", methods=["PUT"])
@token_required
def update_cam(current_user, camera_id):
    """Update a camera."""
    if current_user.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    data = request.get_json()
    updated = update_camera(camera_id, **data)

    if not updated:
        return jsonify({"error": "Camera not found or nothing to update"}), 404

    return jsonify({"message": "Camera updated"})


@camera_bp.route("/api/cameras/<camera_id>", methods=["DELETE"])
@token_required
def delete_cam(current_user, camera_id):
    """Delete a camera."""
    if current_user.get("role") != "admin":
        return jsonify({"error": "Admin access required"}), 403

    svc_stop_camera(camera_id)
    deleted = db_delete_camera(camera_id)

    if not deleted:
        return jsonify({"error": "Camera not found"}), 404

    return jsonify({"message": "Camera deleted"})


@camera_bp.route("/api/cameras/<camera_id>/start", methods=["POST"])
@token_required
def start_stream(current_user, camera_id):
    """Start streaming from a camera."""
    camera = get_camera(camera_id)
    if not camera:
        return jsonify({"error": "Camera not found"}), 404

    source = camera.get("rtsp_url", "0")
    if not source:
        return jsonify({"error": "No stream URL configured"}), 400

    from app import socketio
    success = svc_start_camera(camera_id, source, socketio)

    if success:
        update_camera(camera_id, status="active")
        return jsonify({"message": f"Camera {camera_id} streaming started"})
    else:
        return jsonify({"error": "Failed to start camera stream"}), 500


@camera_bp.route("/api/cameras/<camera_id>/stop", methods=["POST"])
@token_required
def stop_stream(current_user, camera_id):
    """Stop streaming from a camera."""
    success = svc_stop_camera(camera_id)
    if success:
        update_camera(camera_id, status="inactive")
        return jsonify({"message": f"Camera {camera_id} stopped"})
    else:
        return jsonify({"error": "Camera not streaming"}), 404
