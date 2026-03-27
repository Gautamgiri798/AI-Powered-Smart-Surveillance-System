"""Video ingestion and streaming service."""
import cv2
import sys
import time
import platform
import threading
from config import Config
from utils.frame_utils import resize_frame, encode_frame_to_base64, draw_detections
from services.detection_service import detect_objects, get_detection_summary
from services.tracking_service import get_tracker
from services.behavior_service import analyze_behavior
from services.nlp_service import scene_engine
from models.db import get_camera

IS_WINDOWS = platform.system() == "Windows"


class CameraStream:
    """Manages a single camera feed with detection pipeline."""

    def __init__(self, camera_id: str, source, socketio=None):
        self.camera_id = camera_id
        self.source = source
        self.socketio = socketio
        self.cap = None
        self.running = False
        self.thread = None
        self.latest_frame = None
        self.latest_detections = []
        self.frame_count = 0
        self.fps = 0
        self._fps_start = time.time()
        self._fps_counter = 0
        self._last_alert_time = {}  # Throttle alerts
        self._is_detecting = False
        self._last_detect_time = 0

        # Prefetch camera metadata for NLP context
        cam_data = get_camera(self.camera_id)
        self.camera_name = cam_data.get("name", "Surveillance Node") if cam_data else "Surveillance Node"

    def start(self):
        """Start the camera stream."""
        if self.running:
            return True

        # Parse source (int for USB/system camera, string for RTSP/file)
        try:
            source = int(self.source)
            is_usb = True
        except (ValueError, TypeError):
            source = self.source
            is_usb = False

        self.cap = self._open_camera(source, is_usb)

        if self.cap is None or not self.cap.isOpened():
            print(f"[CAMERA {self.camera_id}] ❌ Failed to open: {self.source}")
            return False

        # Set capture properties for USB cameras
        if is_usb:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, Config.FRAME_WIDTH)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, Config.FRAME_HEIGHT)
            self.cap.set(cv2.CAP_PROP_FPS, Config.FPS_LIMIT)

        ret, test_frame = self.cap.read()
        if not ret or test_frame is None:
            print(f"[CAMERA {self.camera_id}] ❌ Camera opened but cannot read frames")
            self.cap.release()
            return False

        print(f"[CAMERA {self.camera_id}] ✅ Video Source active — resolution: "
              f"{test_frame.shape[1]}x{test_frame.shape[0]}")

        self.running = True
        self.thread = threading.Thread(target=self._stream_loop, daemon=True)
        self.thread.start()
        print(f"[CAMERA {self.camera_id}] 🎥 Streaming started from: {self.source}")
        return True

    def _open_camera(self, source, is_usb):
        """Open camera and set requested HD resolution with fallbacks (optimized for Windows)."""
        if not is_usb:
            return cv2.VideoCapture(source)
            
        # On Windows, DirectShow is much faster at initiating the stream
        backend = cv2.CAP_DSHOW if IS_WINDOWS else cv2.CAP_ANY

        # Try primary index
        cap = cv2.VideoCapture(source, backend)
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, Config.FRAME_WIDTH)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, Config.FRAME_HEIGHT)
            return cap
            
        # Try alternate index (0 <-> 1 swap) if primary fails
        alt_source = 0 if str(source) == "1" else 1
        print(f"[CAMERA {self.camera_id}] Primary {source} failed, trying fallback {alt_source}...")
        cap = cv2.VideoCapture(alt_source, backend)
        if cap.isOpened():
            cap.set(cv2.CAP_PROP_FRAME_WIDTH, Config.FRAME_WIDTH)
            cap.set(cv2.CAP_PROP_FRAME_HEIGHT, Config.FRAME_HEIGHT)
            return cap
            
        return None

    def stop(self):
        """Stop the camera stream."""
        self.running = False
        if self.cap:
            self.cap.release()
        print(f"[CAMERA {self.camera_id}] Stopped")

    def _stream_loop(self):
        """Main streaming loop with asynchronous detection."""
        frame_delay = 1.0 / Config.FPS_LIMIT
        is_file = isinstance(self.source, str) and not self.source.startswith("rtsp://")
        
        while self.running:
            ret, frame = self.cap.read()
            if (not ret or frame is None) and is_file:
                self.cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                ret, frame = self.cap.read()

            if not ret or frame is None:
                print(f"[CAMERA {self.camera_id}] ⚠️ Frame read failed, retrying...")
                time.sleep(1)
                continue

            frame = resize_frame(frame)
            self.frame_count += 1
            self._fps_counter += 1

            # Calculate FPS
            elapsed = time.time() - self._fps_start
            if elapsed >= 1.0:
                self.fps = self._fps_counter / elapsed
                self._fps_counter = 0
                self._fps_start = time.time()

            # Run detection asynchronously (max ~3Hz)
            now = time.time()
            if not self._is_detecting and (now - self._last_detect_time) > 0.3:
                self._is_detecting = True
                self._last_detect_time = now
                threading.Thread(target=self._run_detection, args=(frame.copy(),), daemon=True).start()

            # Broadcast frame
            if self.socketio:
                annotated_frame = draw_detections(frame.copy(), self.latest_detections)
                # HUD info
                cv2.putText(annotated_frame, f"FPS: {self.fps:.1f}", (10, 25),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.7, (34, 197, 94), 2)
                
                frame_b64 = encode_frame_to_base64(annotated_frame)
                self.socketio.emit("video_frame", {
                    "camera_id": self.camera_id,
                    "frame": frame_b64,
                    "timestamp": time.time()
                })

            time.sleep(frame_delay)

    def _run_detection(self, frame):
        """Worker function for detection and analysis."""
        try:
            detections = detect_objects(frame)
            tracker = get_tracker(self.camera_id)
            detections = tracker.update(detections)
            self.latest_detections = detections

            # Analyze behavior (Rule-based + SentryLSTM)
            behaviors = analyze_behavior(self.camera_id, detections)

            # --- Multimodal AI: NLP Scene Understanding ---
            briefing = scene_engine.generate_report(
                self.camera_id, 
                self.camera_name,
                detections, 
                behaviors
            )
            
            if self.socketio:
                self.socketio.emit("scene_briefing", briefing)

            # Handle Alerts (Decoupled emitting)
            for behavior in behaviors:
                b_type = behavior.get("id") or behavior["type"]
                now = time.time()
                
                # Severity-based Throttling
                severity = behavior.get("severity", "info")
                throttle = 1 if severity in ["critical", "high"] else 5
                
                if now - self._last_alert_time.get(b_type, 0) > throttle:
                    self._last_alert_time[b_type] = now
                    # Import alert_service locally to avoid circularity
                    from services.alert_service import create_alert
                    alert = create_alert(self.camera_id, behavior)
                    
                    if self.socketio:
                        # Broadcast globally so App.jsx alerts hook catches it
                        self.socketio.emit("alert", alert)
                        # Also push to specific camera room if needed
                        self.socketio.emit(f"alert_{self.camera_id}", alert)

            # Emit summary
            if self.socketio:
                summary = get_detection_summary(detections)
                summary.update({
                    "camera_id": self.camera_id,
                    "fps": round(self.fps, 1)
                })
                self.socketio.emit("detection_update", summary)

        except Exception as e:
            print(f"[CAMERA {self.camera_id}] ❌ AI Thread error: {e}")
        finally:
            self._is_detecting = False


# Global stream manager
_streams = {}

def start_camera(camera_id: str, source, socketio=None):
    if camera_id in _streams:
        _streams[camera_id].stop()

    stream = CameraStream(camera_id, source, socketio)
    if stream.start():
        _streams[camera_id] = stream
        return True
    return False

def stop_camera(camera_id: str):
    if camera_id in _streams:
        _streams[camera_id].stop()
        del _streams[camera_id]
        return True
    return False

def stop_all_cameras():
    for cam_id in list(_streams.keys()):
        _streams[cam_id].stop()
    _streams.clear()

def get_active_cameras():
    return list(_streams.keys())

def get_stream(camera_id: str):
    return _streams.get(camera_id)
