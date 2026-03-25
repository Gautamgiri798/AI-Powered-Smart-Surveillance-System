import os

class Config:
    """Application configuration."""
    SECRET_KEY = os.environ.get("SECRET_KEY", "safetysnap-secret-key-2026")

    # SQLite3 Database
    SQLITE_DB = os.environ.get("SQLITE_DB", os.path.join(
        os.path.dirname(os.path.abspath(__file__)), "safetysnap.db"
    ))

    JWT_EXPIRATION_HOURS = int(os.environ.get("JWT_EXPIRATION_HOURS", 24))

    # YOLO Configuration
    YOLO_MODEL = os.environ.get("YOLO_MODEL", "yolov8n.pt")
    YOLO_CONFIDENCE = float(os.environ.get("YOLO_CONFIDENCE", 0.45))
    DETECTION_CLASSES = [0, 43, 76]  # person, knife, scissors (COCO)
    WEAPON_CLASSES = [43, 76]  # knife, scissors

    # Video Configuration
    FRAME_WIDTH = int(os.environ.get("FRAME_WIDTH", 640))
    FRAME_HEIGHT = int(os.environ.get("FRAME_HEIGHT", 480))
    FPS_LIMIT = int(os.environ.get("FPS_LIMIT", 15))

    # Alert Configuration
    LOITERING_THRESHOLD_SEC = int(os.environ.get("LOITERING_THRESHOLD_SEC", 60))
    HIGH_VELOCITY_THRESHOLD = float(os.environ.get("HIGH_VELOCITY_THRESHOLD", 180.0))

    # CORS
    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*")
