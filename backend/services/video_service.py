"""Video ingestion and streaming service (Hardened AI Worker Model)."""
import cv2
import numpy as np
import sys
import time
import platform
import threading
import queue
from config import Config
from utils.frame_utils import resize_frame, encode_frame_to_base64, draw_detections
from services.detection_service import detect_objects, get_detection_summary
from services.tracking_service import get_tracker
from services.behavior_service import analyze_behavior
from services.nlp_service import scene_engine
from models.db import get_camera

IS_WINDOWS = platform.system() == "Windows"

class VirtualCapture:
    """Simulated camera for development and demonstration."""
    def __init__(self):
        self.frame_count = 0
        self.width = 640
        self.height = 360
        self.is_opened = True

    def isOpened(self):
        return self.is_opened

    def read(self):
        self.frame_count += 1
        frame = np.zeros((self.height, self.width, 3), dtype=np.uint8)
        # Background: dark blue gradient
        for y in range(self.height):
            frame[y, :, 0] = min(255, 20 + (y // 10))
            frame[y, :, 1] = 10
            frame[y, :, 2] = 40
        
        # Draw moving "Subject" (simulated person)
        import math
        px = int(320 + 200 * math.sin(self.frame_count * 0.05))
        py = int(180 + 50 * math.cos(self.frame_count * 0.03))
        # Draw a white rectangle for "Person"
        cv2.rectangle(frame, (px-20, py-50), (px+20, py+50), (220, 220, 220), -1)
        # Head
        cv2.circle(frame, (px, py-60), 15, (220, 220, 220), -1)
        
        cv2.putText(frame, "STATUS: VIRTUAL_SIMULATION_ACTIVE", (30, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 150, 255), 2)
        cv2.putText(frame, "NO HARDWARE DETECTED - FALLING BACK TO CORE SIM", (30, 60), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
        
        return True, frame

    def release(self):
        self.is_opened = False

    def set(self, propId, value):
        pass

class CameraStream:
    """Persistent AI Worker Architecture (Zero-Spawning overhead for maximum speed)."""
    
    _emit_lock = threading.Lock()

    def __init__(self, camera_id: str, source, socketio=None):
        self.camera_id = camera_id
        self.source = source
        self.socketio = socketio
        self.cap = None
        self.running = False
        
        # State Matricies
        self.latest_detections = []
        self.latest_status = {} # Map of tid -> action_status
        self.frame_count = 0
        self.fps = 0
        self._fps_start = time.time()
        self._fps_counter = 0
        self._last_alert_time = {}
        
        # Persistent AI Worker Protocol
        self.ai_queue = queue.Queue(maxsize=1) # Always keep latest frame only
        self.ai_thread = None
        self.stream_thread = None
        self.camera_name = "Surveillance Node"

    def start(self):
        """Unified Mission Start (Worker Model)."""
        is_usb = str(self.source).isdigit() or self.source.startswith("USB")
        source = int(self.source) if is_usb else self.source
        
        self.cap = self._open_camera(source, is_usb)
        if self.cap is None or not self.cap.isOpened():
            print(f"[MISSION {self.camera_id}] ❌ FAIL: Hardware Busy.")
            return False

        self.running = True
        
        # Thread 1: Mission Streamer
        self.stream_thread = threading.Thread(target=self._stream_loop, daemon=True)
        self.stream_thread.start()
        
        # Thread 2: Mission AI Worker (Starts once, runs forever)
        self.ai_thread = threading.Thread(target=self._ai_worker_loop, daemon=True)
        self.ai_thread.start()
        
        print(f"[MISSION {self.camera_id}] 🛰️ LINK ESTABLISHED: Persistent AI Engine ONLINE.")
        return True

    def _open_camera(self, source, is_usb):
        """Intelligent Multi-Backend Opener with Virtual Fallback."""
        backends = [cv2.CAP_DSHOW, cv2.CAP_MSMF, cv2.CAP_ANY] if IS_WINDOWS else [cv2.CAP_ANY]
        for backend in backends:
            try:
                cap = cv2.VideoCapture(source, backend)
                if cap.isOpened():
                    cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
                    cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 360)
                    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                    return cap
            except:
                continue

        # --- VIRTUAL FALLBACK (If Hardware Fails) ---
        print(f"[MISSION {self.camera_id}] ⚠️ HARDWARE FAIL. ACTIVATING VIRTUAL SIMULATOR...")
        return VirtualCapture()

    def stop(self):
        """Safe Hardware Release."""
        self.running = False
        if self.cap: self.cap.release()

    def _stream_loop(self):
        """High-Frequency Broadcaster (Optimized for Video Fluidity)."""
        frame_delay = 1.0 / Config.FPS_LIMIT
        
        while self.running:
            loop_start = time.time()
            
            # 1. Physical Capture
            ret, frame = self.cap.read()
            if not ret or frame is None:
                print(f"[MISSION {self.camera_id}] ⚠️ WARN: Failed to capture frame.")
                time.sleep(0.5)
                continue

            fh, fw = frame.shape[:2]
            # Emit in 480p for bandwidth efficiency
            frame_disp = cv2.resize(frame, (480, 270))
            if hasattr(Config, 'MIRROR_FEED') and Config.MIRROR_FEED:
                frame_disp = cv2.flip(frame_disp, 1)
            
            # 2. Feed the AI Worker (Non-blocking)
            try:
                if self.ai_queue.empty():
                    self.ai_queue.put_nowait(frame.copy())
            except queue.Full:
                pass # Already has latest frame cached

            # 3. Synchronized Emission
            if self.socketio:
                annotated = draw_detections(
                    frame_disp.copy(), 
                    self.latest_detections, 
                    orig_size=(fw, fh),
                    status_map=self.latest_status
                )
                b64 = encode_frame_to_base64(annotated)
                
                with self._emit_lock:
                    self.socketio.emit("video_frame", {
                        "camera_id": self.camera_id, 
                        "frame": b64, 
                        "timestamp": time.time()
                    })

            # 4. Global Sync Cycle
            elapsed = time.time() - loop_start
            time.sleep(max(0.01, frame_delay - elapsed))

    def _ai_worker_loop(self):
        """Dedicated AI Engine Worker (Zero Thread Context Swapping)."""
        print(f"[AI WORKER {self.camera_id}] Active and waiting for signal...")
        while self.running:
            try:
                # Wait for next frame to analyze
                frame = self.ai_queue.get(timeout=1.0)
                
                # Perform Core Inference
                detections = detect_objects(frame)
                tracker = get_tracker(self.camera_id)
                detections = tracker.update(detections, frame=frame)
                self.latest_detections = detections
                
                # Dynamic Behavioral Pass
                behaviors = analyze_behavior(self.camera_id, detections)
                
                # Extract Action Status Map for HUD
                for b in behaviors:
                    if b.get("type") == "status_update":
                        self.latest_status = b.get("status_map", {})
                        break
                
                if self.socketio:
                    with self._emit_lock:
                        self.socketio.emit("live_behaviors", {"camera_id": self.camera_id, "behaviors": behaviors})
                        summary = get_detection_summary(detections)
                        self.socketio.emit("detection_update", {**summary, "camera_id": self.camera_id})
                    
                    # NLP Report Engine
                    briefing = scene_engine.generate_report(self.camera_id, "Node", detections, behaviors)
                    with self._emit_lock:
                        self.socketio.emit("scene_briefing", briefing)

                # Tactical Alert Routing (Critical & High-Value Events)
                from services.alert_service import create_alert
                for b in behaviors:
                    b_type = b.get("type", "unknown")
                    severity = b.get("severity", "info")
                    
                    if b_type == "status_update":
                        continue
                        
                    b_key = f"{self.camera_id}_{b_type}"
                    if time.time() - self._last_alert_time.get(b_key, 0) > 5.0:
                        self._last_alert_time[b_key] = time.time()
                        
                        frame_url = None
                        if severity in ["critical", "high"]:
                            from utils.frame_utils import save_alert_frame
                            frame_url = save_alert_frame(frame, self.camera_id)

                        alert_data = create_alert(self.camera_id, b, frame_url=frame_url)
                        print(f"[MISSION ALERT] {self.camera_id} // {b_type.upper()} // SEV: {severity.upper()}")
                        
                        with self._emit_lock:
                            self.socketio.emit("alert", alert_data)
                
                self.ai_queue.task_done()
                
            except queue.Empty:
                continue
            except Exception as e:
                import traceback
                print(f"[AI WORKER ERROR]: {e}")
                traceback.print_exc()
                time.sleep(0.5)

# Global Manager
_streams = {}

def start_camera(camera_id, source, socketio=None):
    if camera_id in _streams:
        _streams[camera_id].stop()
    stream = CameraStream(camera_id, source, socketio)
    if stream.start():
        _streams[camera_id] = stream
        return True
    return False

def stop_camera(camera_id):
    if camera_id in _streams:
        _streams[camera_id].stop()
        del _streams[camera_id]
        return True
    return False

def get_active_cameras():
    return list(_streams.keys())

def get_stream(camera_id):
    return _streams.get(camera_id)
