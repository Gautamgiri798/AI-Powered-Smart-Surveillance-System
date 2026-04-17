"""
SafetySnap — AI-Powered Smart Surveillance System
Main application entry point.
"""
# import eventlet
# eventlet.monkey_patch()

from flask import Flask, jsonify, send_from_directory
from flask_socketio import SocketIO
from flask_cors import CORS
import os
from config import Config

# Initialize Flask app
app = Flask(__name__)
app.config["SECRET_KEY"] = Config.SECRET_KEY
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024 # 500MB limit for mission clips


# Initialize extensions
CORS(app, origins=Config.CORS_ORIGINS)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading', ping_timeout=10, ping_interval=5)

# Register blueprints
from routes.auth_routes import auth_bp
from routes.camera_routes import camera_bp
from routes.event_routes import event_bp
from routes.stream_routes import stream_bp
from routes.analysis_routes import analysis_bp

app.register_blueprint(auth_bp)
app.register_blueprint(camera_bp)
app.register_blueprint(event_bp)
app.register_blueprint(stream_bp)
app.register_blueprint(analysis_bp)

# ----- Forensic Asset Serving -----
@app.route('/static/alerts/<path:filename>')
def serve_alert_image(filename):
    return send_from_directory(os.path.join(app.root_path, 'static', 'alerts'), filename)

# ----- Root & Health -----
@app.route("/")
def home():
    return jsonify({
        "name": "SafetySnap — AI Surveillance System",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "auth": "/api/auth/login",
            "cameras": "/api/cameras",
            "events": "/api/events",
            "streams": "/api/streams",
            "health": "/api/health"
        }
    })


@app.route("/api/health")
def health():
    from services.video_service import get_active_cameras, get_stream
    active = get_active_cameras()
    streams_info = {}
    for cam_id in active:
        stream = get_stream(cam_id)
        if stream:
            streams_info[cam_id] = {
                "active": stream.running,
                "fps": round(stream.fps, 1),
                "frames": stream.frame_count,
                "detections": len(stream.latest_detections)
            }
    return jsonify({
        "status": "healthy",
        "streams": streams_info
    })


# ----- SocketIO Events -----
@socketio.on("connect")
def on_connect():
    print("[WS] Client connected")


@socketio.on("disconnect")
def on_disconnect():
    print("[WS] Client disconnected")


@socketio.on("start_camera")
def ws_start_camera(data):
    """Start a camera stream via WebSocket."""
    camera_id = data.get("camera_id")
    if not camera_id:
        return

    from models.db import get_camera
    from services.video_service import start_camera

    camera = get_camera(camera_id)
    if camera:
        source = camera.get("rtsp_url", "0")
        start_camera(camera_id, source, socketio)
        socketio.emit("camera_status", {
            "camera_id": camera_id,
            "status": "streaming"
        })


@socketio.on("stop_camera")
def ws_stop_camera(data):
    """Stop a camera stream via WebSocket."""
    camera_id = data.get("camera_id")
    if not camera_id:
        return

    from services.video_service import stop_camera
    stop_camera(camera_id)
    socketio.emit("camera_status", {
        "camera_id": camera_id,
        "status": "stopped"
    })


# ----- Startup -----
if __name__ == "__main__":
    # Initialize database
    from models.db import init_db
    init_db()
    
    # Pre-load the YOLO model in a background thread to prevent port-blocking hangs
    # on slower Windows systems.
    print("[SYSTEM] INITIALIZING MISSION AI CORE IN BACKGROUND...")
    import threading
    from services.detection_service import get_model
    threading.Thread(target=get_model, daemon=True).start()
    
    # Run the server with Flask-SocketIO
    print(f"\n[SYSTEM] Starting server on port 5555...")
    socketio.run(app, host="0.0.0.0", port=5555, debug=True, allow_unsafe_werkzeug=True)
