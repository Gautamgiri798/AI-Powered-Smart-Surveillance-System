"""SentryLSTM: Advanced Temporal Sequence Analysis Service."""
import numpy as np
from collections import deque

class SequenceBehaviorService:
    """
    Simulates LSTM-like temporal analysis by monitoring 
    skeletal and movement sequences over a sliding window.
    """
    
    def __init__(self, window_size=30):
        self.window_size = window_size
        # Memory buffer: {camera_id: {track_id: deque([data_points])}}
        self.memory = {}

    def update_and_analyze(self, camera_id: str, track_id: int, data: dict) -> list:
        """
        Feeds new data point into the sequence memory and returns detected anomalies.
        """
        if track_id is None: return []

        if camera_id not in self.memory:
            self.memory[camera_id] = {}
        
        if track_id not in self.memory[camera_id]:
            self.memory[camera_id][track_id] = deque(maxlen=self.window_size)
        
        # Store essential temporal features: velocity, y-position, keypoint-variance
        self.memory[camera_id][track_id].append(data)
        
        buffer = list(self.memory[camera_id][track_id])
        if len(buffer) < self.window_size:
            return [] # Insufficient temporal data for LSTM-pass

        return self._detect_temporal_anomalies(buffer)

    def _detect_temporal_anomalies(self, buffer: list) -> list:
        """
        Advanced heuristic analysis of the last N frames.
        """
        anomalies = []
        
        # 1. SUSTAINED HIGH VELOCITY (Aggressive Running)
        velocities = [b.get("velocity", 0) for b in buffer]
        if np.mean(velocities) > 180 and np.std(velocities) < 50:
            anomalies.append({
                "type": "aggressive_running",
                "severity": "high",
                "description": "🚨 AGGRESSIVE RUNNING: Sustained high-speed movement detected!"
            })

        # 2. SUDDEN DROP (Fall Verification via Sequence)
        y_pos = [b.get("bbox", [0,0,0,0])[3] for b in buffer] # Bottom coord
        if len(y_pos) >= 10:
            # Check for a sudden decrease in box height (rapid expansion horizontally)
            # This is more accurate than a single-frame ratio
            delta = y_pos[-1] - y_pos[0]
            if delta > 100: # Rapid descent in 30 frames
                 # Verify with current ratio
                 last_bbox = buffer[-1].get("bbox", [0,0,0,1])
                 w = last_bbox[2] - last_bbox[0]
                 h = last_bbox[3] - last_bbox[1]
                 if h > 0 and (w / h) > 1.3:
                    anomalies.append({
                        "type": "sustained_fall",
                        "severity": "critical",
                        "description": "🚨 CRITICAL: Sequence analysis confirms a rapid human collapse!"
                    })

        # 3. ERRATIC MOVEMENT (Potential Conflict/Fighting)
        if len(velocities) > 15:
            # Calculate acceleration (change in velocity)
            accel = np.diff(velocities)
            if np.max(np.abs(accel)) > 100:
                anomalies.append({
                    "type": "erratic_movement",
                    "severity": "medium",
                    "description": "⚡ ERRATIC BEHAVIOR: Sudden bursts of movement/conflict detected!"
                })

        return anomalies

# Global Singleton
sentry_lstm = SequenceBehaviorService()
