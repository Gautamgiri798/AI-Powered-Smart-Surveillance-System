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
from services.alert_service import create_alert

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

        # Open camera with platform-appropriate backend
        self.cap = self._open_camera(source, is_usb)

        if self.cap is None or not self.cap.isOpened():
            print(f"[CAMERA {self.camera_id}] ❌ Failed to open: {self.source}")
            return False

        # Set capture properties for USB cameras
        if is_usb:
            self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, Config.FRAME_WIDTH)
            self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, Config.FRAME_HEIGHT)
            self.cap.set(cv2.CAP_PROP_FPS, Config.FPS_LIMIT)

        # Verify we can actually read a frame
        ret, test_frame = self.cap.read()
        if not ret or test_frame is None:
            print(f"[CAMERA {self.camera_id}] ❌ Camera opened but cannot read frames")
            self.cap.release()
            return False

        print(f"[CAMERA {self.camera_id}] ✅ Webcam active — resolution: "
              f"{test_frame.shape[1]}x{test_frame.shape[0]}")

        self.running = True
        self.thread = threading.Thread(target=self._stream_loop, daemon=True)
        self.thread.start()
        print(f"[CAMERA {self.camera_id}] 🎥 Streaming started from: {self.source}")
        return True

    def _open_camera(self, source, is_usb):
        """Open camera with the best available backend."""
        # Most modern webcams connect instantly using default backend 
        # (forcing DSHOW or MSMF often causes a 5-10 sec delay on Windows)
        cap = cv2.VideoCapture(source)
        if cap.isOpened():
            print(f"[CAMERA {self.camera_id}] ✅ Backend OK")
            return cap
            
        print(f"[CAMERA {self.camera_id}] Trying DSHOW fallback...")
        cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
        if cap.isOpened():
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
        self._is_detecting = False

        while self.running:
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

            # Run detection asynchronously if not busy (max 3 times per second for snap-response)
            now = time.time()
            if not getattr(self, '_last_detect_time', False):
                self._last_detect_time = 0
                
            if not self._is_detecting and (now - self._last_detect_time) > 0.3:
                self._is_detecting = True
                self._last_detect_time = now
                threading.Thread(target=self._run_detection, args=(frame.copy(),), daemon=True).start()

            # Draw latest known detections on current frame
            annotated_frame = draw_detections(frame.copy(), self.latest_detections)

            # Add HUD info
            cv2.putText(annotated_frame, f"FPS: {self.fps:.1f}", (10, 25),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            cv2.putText(annotated_frame, f"CAM: {self.camera_id}", (10, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)

            self.latest_frame = annotated_frame

            # Emit frame via SocketIO
            if self.socketio:
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

            # Analyze behavior
            behaviors = analyze_behavior(self.camera_id, detections)

            # Generate alerts
            for behavior in behaviors:
                alert_type = behavior["type"]
                now = time.time()
                
                # Determine throttle time based on severity for continuous detection
                # 5s for routine alerts, 1s for critical/weapon threats to ensure constant monitoring
                is_routine = alert_type in ["running_person", "loitering"]
                throttle_sec = 5 if is_routine else 1

                if alert_type in self._last_alert_time:
                    if now - self._last_alert_time[alert_type] < throttle_sec:
                        continue
                self._last_alert_time[alert_type] = now

                alert = create_alert(self.camera_id, behavior)
                if self.socketio:
                    self.socketio.emit("alert", alert)

            # Emit detection summary
            if self.socketio:
                summary = get_detection_summary(detections)
                summary["camera_id"] = self.camera_id
                summary["fps"] = round(self.fps, 1)
                self.socketio.emit("detection_update", summary)

        except Exception as e:
            print(f"[CAMERA {self.camera_id}] ❌ Detection thread error: {e}")
        finally:
            self._is_detecting = False


# Global stream manager
_streams = {}


def start_camera(camera_id: str, source, socketio=None):
    """Start a camera stream."""
    if camera_id in _streams:
        _streams[camera_id].stop()

    stream = CameraStream(camera_id, source, socketio)
    success = stream.start()
    if success:
        _streams[camera_id] = stream
    return success


def stop_camera(camera_id: str):
    """Stop a camera stream."""
    if camera_id in _streams:
        _streams[camera_id].stop()
        del _streams[camera_id]
        return True
    return False


def stop_all_cameras():
    """Stop all camera streams."""
    for cam_id in list(_streams.keys()):
        _streams[cam_id].stop()
    _streams.clear()


def get_active_cameras():
    """Get list of active camera IDs."""
    return list(_streams.keys())


def get_stream(camera_id: str):
    """Get a camera stream instance."""
    return _streams.get(camera_id)
