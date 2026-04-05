import os

class Config:
    """Application configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "safetysnap-secret-key-2026")

    # SQLite3 Database
    SQLITE_DB = os.environ.get("SQLITE_DB", os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "safetysnap.db"
    ))

    JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))

    # YOLO Global AI Engine - UNLOCKED FULL SPECTRUM (COCO 0-79)
    YOLO_MODEL = os.environ.get("YOLO_MODEL", "yolov8s-pose_openvino_model")
    YOLO_CONFIDENCE = float(os.environ.get("YOLO_CONFIDENCE", 0.50))
    DETECTION_CLASSES = list(range(80))
    WEAPON_CLASSES = [43, 34, 76]  # Knife, Baseball Bat, Scissors (useful for testing weapon detection)
    TRACKER_TYPE = "deepsort"   # Options: "centroid", "deepsort"

    # Performance Optimized Kinetic Streaming Protocols (480p Failsafe)
    FRAME_WIDTH = int(os.environ.get("FRAME_WIDTH", 480))
    FRAME_HEIGHT = int(os.environ.get("FRAME_HEIGHT", 270))
    FPS_LIMIT = int(os.environ.get("FPS_LIMIT", 8))
    MIRROR_FEED = False
    Showcase_Refreshed_Matrix = True

    # Behavioral Intelligence Config
    LOITERING_THRESHOLD_SEC = int(os.environ.get("LOITERING_THRESHOLD_SEC", 30))
    HIGH_VELOCITY_THRESHOLD = float(os.environ.get("HIGH_VELOCITY_THRESHOLD", 200.0))
    FALL_THRESHOLD_RATIO = 1.6  # Width/Height ratio to trigger fall alert
    CROWD_DENSITY_LIMIT = 5     # Minimum persons to flag a crowd
    # Restricted area recalibrated (Y=0.85 — extreme bottom for ground-level detection)
    RESTRICTED_ZONE_Y = 0.85

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
