"""Simple object tracking service using centroid-based tracking."""
import math
import time
from collections import defaultdict


class SimpleTracker:
    """
    Centroid-based multi-object tracker.
    Assigns persistent IDs to detected objects across frames.
    """

    def __init__(self, max_disappeared=30, max_distance=80):
        self.next_id = 0
        self.objects = {}        # id -> centroid
        self.disappeared = {}    # id -> frame count since last seen
        self.positions = defaultdict(list)  # id -> list of (centroid, timestamp)
        self.max_disappeared = max_disappeared
        self.max_distance = max_distance

    def _distance(self, p1, p2):
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    def update(self, detections):
        """
        Update tracker with new detections.
        
        Args:
            detections: list of dicts with 'center' key
        
        Returns:
            list of dicts: detections with added 'track_id' key
        """
        if len(detections) == 0:
            # Mark all existing objects as disappeared
            for obj_id in list(self.disappeared.keys()):
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self._deregister(obj_id)
            return detections

        input_centroids = [d["center"] for d in detections]

        if len(self.objects) == 0:
            # Register all new detections
            for i, centroid in enumerate(input_centroids):
                track_id = self._register(centroid)
                detections[i]["track_id"] = track_id
            return detections

        # Match existing objects to new detections using min distance
        object_ids = list(self.objects.keys())
        object_centroids = list(self.objects.values())

        used_rows = set()
        used_cols = set()
        assignments = {}

        # Compute distance matrix and find best matches
        distances = []
        for i, obj_centroid in enumerate(object_centroids):
            for j, det_centroid in enumerate(input_centroids):
                dist = self._distance(obj_centroid, det_centroid)
                distances.append((dist, i, j))

        distances.sort(key=lambda x: x[0])

        for dist, row, col in distances:
            if row in used_rows or col in used_cols:
                continue
            if dist > self.max_distance:
                continue
            obj_id = object_ids[row]
            assignments[col] = obj_id
            used_rows.add(row)
            used_cols.add(col)

        # Update matched objects
        for col, obj_id in assignments.items():
            self.objects[obj_id] = input_centroids[col]
            self.disappeared[obj_id] = 0
            self.positions[obj_id].append((input_centroids[col], time.time()))
            # Keep only last 100 positions
            if len(self.positions[obj_id]) > 100:
                self.positions[obj_id] = self.positions[obj_id][-100:]
            detections[col]["track_id"] = obj_id

        # Handle unmatched objects (disappeared)
        for row in range(len(object_centroids)):
            if row not in used_rows:
                obj_id = object_ids[row]
                self.disappeared[obj_id] += 1
                if self.disappeared[obj_id] > self.max_disappeared:
                    self._deregister(obj_id)

        # Register new detections
        for col in range(len(input_centroids)):
            if col not in assignments:
                track_id = self._register(input_centroids[col])
                detections[col]["track_id"] = track_id

        return detections

    def _register(self, centroid):
        obj_id = self.next_id
        self.objects[obj_id] = centroid
        self.disappeared[obj_id] = 0
        self.positions[obj_id] = [(centroid, time.time())]
        self.next_id += 1
        return obj_id

    def _deregister(self, obj_id):
        del self.objects[obj_id]
        del self.disappeared[obj_id]
        if obj_id in self.positions:
            del self.positions[obj_id]

    def get_velocity(self, track_id):
        """Calculate displacement-based velocity of a tracked object (pixels/second)."""
        if track_id not in self.positions or len(self.positions[track_id]) < 2:
            return 0.0

        positions = self.positions[track_id]
        # Use a larger window (10 frames) for smoother velocity estimation
        recent = positions[-10:]

        if len(recent) < 2:
            return 0.0

        # Calculate displacement (direct distance from first to last point in window)
        # This reduces noise from bounding box jitter
        displacement = self._distance(recent[0][0], recent[-1][0])
        time_diff = recent[-1][1] - recent[0][1]

        if time_diff <= 0.05: # Guard against zero or near-zero time diff
            return 0.0

        return displacement / time_diff

    def get_stationary_time(self, track_id, threshold_distance=15):
        """Get how long an object has been stationary (seconds)."""
        if track_id not in self.positions or len(self.positions[track_id]) < 2:
            return 0.0

        positions = self.positions[track_id]
        current_pos = positions[-1][0]
        current_time = positions[-1][1]

        stationary_since = current_time
        for i in range(len(positions) - 2, -1, -1):
            past_pos, past_time = positions[i]
            if self._distance(current_pos, past_pos) > threshold_distance:
                break
            stationary_since = past_time

        return current_time - stationary_since


# Global tracker instances per camera
_trackers = {}


def get_tracker(camera_id: str) -> SimpleTracker:
    """Get or create a tracker for a camera."""
    if camera_id not in _trackers:
        _trackers[camera_id] = SimpleTracker()
    return _trackers[camera_id]
