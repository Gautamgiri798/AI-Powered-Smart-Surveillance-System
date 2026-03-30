import os

class Config:
    """Application configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "safetysnap-secret-key-2026")

    # SQLite3 Database
    SQLITE_DB = os.environ.get("SQLITE_DB", os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "safetysnap.db"
    ))

    JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))

    # YOLO Global AI Engine (Security & Pose Optimized)
    # Using yolov8s-pose for high-fidelity human activity & skeletal tracking
    YOLO_MODEL = os.environ.get("YOLO_MODEL", "yolov8s-pose_openvino_model")
    YOLO_CONFIDENCE = float(os.environ.get("YOLO_CONFIDENCE", 0.40))
    # Curated AI Spectrum: Excludes problematic hallucination classes (cats, dogs, toothbrushes, tiny items) while retaining full indoor/outdoor awareness
    DETECTION_CLASSES = [
        0, 1, 2, 3, 5, 7, 9, 11, 13, # person, vehicles, street objects
        24, 25, 26, 27, 28, # luggage/accessories
        39, 41, 43, # bottle, cup, knife
        56, 57, 58, 59, 60, # indoor furniture
        62, 63, 66, 67, 73, 74, 76 # tech, tools, clock(smartwatch), books
    ]
    WEAPON_CLASSES = [43, 76]  # knife, scissors
    TRACKER_TYPE = "deepsort"   # Options: "centroid", "deepsort"

    # High-Performance Kinetic Streaming Protocols
    FRAME_WIDTH = int(os.environ.get("FRAME_WIDTH", 640))
    FRAME_HEIGHT = int(os.environ.get("FRAME_HEIGHT", 360))
    FPS_LIMIT = int(os.environ.get("FPS_LIMIT", 15))
    MIRROR_FEED = True
    Showcase_Refreshed_Matrix = True

    # Behavioral Intelligence Config
    LOITERING_THRESHOLD_SEC = int(os.environ.get("LOITERING_THRESHOLD_SEC", 30))
    HIGH_VELOCITY_THRESHOLD = float(os.environ.get("HIGH_VELOCITY_THRESHOLD", 150.0))
    FALL_THRESHOLD_RATIO = 1.3  # Width/Height ratio to trigger fall alert
    CROWD_DENSITY_LIMIT = 5     # Minimum persons to flag a crowd
    # Restricted area recalibrated (Y=0.85 — extreme bottom for ground-level detection)
    RESTRICTED_ZONE_Y = 0.85

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
