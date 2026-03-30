"""Simple object tracking service using centroid-based tracking."""
import math
import time
from collections import defaultdict


try:
    from deep_sort_realtime.deepsort_tracker import DeepSort
except ImportError:
    DeepSort = None

class SimpleTracker:
    """
    Centroid-based multi-object tracker (Fallback).
    """
    def __init__(self, max_disappeared=30, max_distance=80):
        self.next_id = 0
        self.objects = {}
        self.disappeared = {}
        self.positions = defaultdict(list)
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def _distance(self, p1, p2):
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    def update(self, detections, frame=None):
        if len(detections) == 0:
            for obj_id in list(self.disappeared.keys()):
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self._deregister(obj_id)
            return detections
        input_centroids = [d["center"] for d in detections]
        if len(self.objects) == 0:
            for i, centroid in enumerate(input_centroids):
                track_id = self._register(centroid)
                detections[i]["track_id"] = track_id
            return detections
        object_ids = list(self.objects.keys())
        object_centroids = list(self.objects.values())
        used_rows, used_cols = set(), set()
        assignments = {}
        distances = []
        for i, obj_centroid in enumerate(object_centroids):
            for j, det_centroid in enumerate(input_centroids):
                dist = self._distance(obj_centroid, det_centroid)
                distances.append((dist, i, j))
        distances.sort(key=lambda x: x[0])
        for dist, row, col in distances:
            if row in used_rows or col in used_cols or dist > self.max_distance: continue
            assignments[col] = object_ids[row]
            used_rows.add(row); used_cols.add(col)
        for col, obj_id in assignments.items():
            self.objects[obj_id] = input_centroids[col]
            self.disappeared[obj_id] = 0
            self.positions[obj_id].append((input_centroids[col], time.time()))
            if len(self.positions[obj_id]) > 100: self.positions[obj_id] = self.positions[obj_id][-100:]
            detections[col]["track_id"] = obj_id
        for row in range(len(object_centroids)):
            if row not in used_rows:
                obj_id = object_ids[row]
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared: self._deregister(obj_id)
        for col in range(len(input_centroids)):
            if col not in assignments:
                track_id = self._register(input_centroids[col])
                detections[col]["track_id"] = track_id
        return detections

    def _register(self, centroid):
        obj_id = self.next_id
        self.objects[obj_id] = centroid; self.disappeared[obj_id] = 0
        self.positions[obj_id] = [(centroid, time.time())]; self.next_id += 1
        return obj_id

    def _deregister(self, obj_id):
        del self.objects[obj_id]; del self.disappeared[obj_id]
        if obj_id in self.positions: del self.positions[obj_id]

    def get_velocity(self, track_id):
        if track_id not in self.positions or len(self.positions[track_id]) < 2: return 0.0
        recent = self.positions[track_id][-10:]
        if len(recent) < 2: return 0.0
        dist = self._distance(recent[0][0], recent[-1][0])
        dt = recent[-1][1] - recent[0][1]
        return dist / dt if dt > 0.05 else 0.0

    def get_stationary_time(self, track_id, threshold=15):
        if track_id not in self.positions or len(self.positions[track_id]) < 2: return 0.0
        pos, t = self.positions[track_id][-1]
        stat_since = t
        for p, pt in reversed(self.positions[track_id][:-1]):
            if self._distance(pos, p) > threshold: break
            stat_since = pt
        return t - stat_since

class DeepSortTracker:
    """
    Elite DeepSort Multi-Object Tracker.
    Uses appearance features (Re-ID) + Kalman Filter.
    """
    def __init__(self, max_age=30):
        if DeepSort is None:
            print("[TRACKER] ⚠️ DeepSort library not found. Falling back to SimpleTracker.")
            self.internal = SimpleTracker(max_disappeared=max_age)
            self.is_deepsort = False
            self.positions = self.internal.positions  # Map simple tracker positions to parent structure
        else:
            self.tracker = DeepSort(max_age=max_age, n_init=3, nms_max_overlap=1.0, max_cosine_distance=0.2)
            self.is_deepsort = True
            # Shared memory for velocity/stationary logic
            self.positions = defaultdict(list)

    def update(self, detections, frame):
        if not self.is_deepsort: return self.internal.update(detections, frame)
        if frame is None: return detections

        # Convert detections to DeepSort format: [ [left, top, w, h], confidence, class_name ]
        raw_detections = []
        for d in detections:
            x1, y1, x2, y2 = d["bbox"]
            raw_detections.append(([x1, y1, x2 - x1, y2 - y1], d["confidence"], str(d["class"])))

        tracks = self.tracker.update_tracks(raw_detections, frame=frame)
        
        tracked_detections = []
        for track in tracks:
            if not track.is_confirmed(): continue
            track_id = int(track.track_id)
            ltrb = track.to_ltrb() # Left, Top, Right, Bottom
            center = [(ltrb[0] + ltrb[2]) / 2, (ltrb[1] + ltrb[3]) / 2]
            
            # Map back to original detection if possible to preserve keypoints/labels
            best_match = None
            min_dist = 50
            for d in detections:
                d_center = d["center"]
                dist = math.sqrt((center[0]-d_center[0])**2 + (center[1]-d_center[1])**2)
                if dist < min_dist:
                    min_dist = dist
                    best_match = d
            
            final_det = best_match.copy() if best_match else {
                "bbox": ltrb.tolist(), "confidence": 1.0, "class": int(track.get_det_class() or 0),
                "label": f"id_{track_id}", "is_weapon": False, "keypoints": None
            }
            final_det["track_id"] = track_id
            final_det["center"] = center
            
            # Update telemetry history
            self.positions[track_id].append((center, time.time()))
            if len(self.positions[track_id]) > 100: self.positions[track_id] = self.positions[track_id][-100:]
            tracked_detections.append(final_det)

        return tracked_detections

    def get_velocity(self, track_id):
        if track_id not in self.positions or len(self.positions[track_id]) < 2: return 0.0
        p = self.positions[track_id]
        recent = p[-10:] if len(p) >= 10 else p
        dist = math.sqrt((recent[0][0][0]-recent[-1][0][0])**2 + (recent[0][0][1]-recent[-1][0][1])**2)
        dt = recent[-1][1] - recent[0][1]
        return dist / dt if dt > 0.05 else 0.0

    def get_stationary_time(self, track_id, threshold=15):
        if track_id not in self.positions or len(self.positions[track_id]) < 2: return 0.0
        p_list = self.positions[track_id]
        pos, t = p_list[-1]
        stat_since = t
        for p, pt in reversed(p_list[:-1]):
            if math.sqrt((pos[0]-p[0])**2 + (pos[1]-p[1])**2) > threshold: break
            stat_since = pt
        return t - stat_since

# Global tracker instances per camera
_trackers = {}

def get_tracker(camera_id: str):
    """Get or create a tracker for a camera based on Config settings."""
    from config import Config
    if camera_id not in _trackers:
        if getattr(Config, 'TRACKER_TYPE', 'centroid') == 'deepsort':
            _trackers[camera_id] = DeepSortTracker()
        else:
            _trackers[camera_id] = SimpleTracker()
    return _trackers[camera_id]

