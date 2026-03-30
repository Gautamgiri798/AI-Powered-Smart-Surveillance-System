"""SentryLSTM: Advanced Temporal Sequence Analysis Service."""
import numpy as np
from collections import deque

class SequenceBehaviorService:
    """
    Simulates LSTM-like temporal analysis by monitoring 
    skeletal and movement sequences over a sliding window.
    """
    
    def __init__(self, window_size=10):
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
        
        # 1. CORE HUMAN STATE (Standing, Sitting, Walking)
        # Using Proportional Ratios (Pose + BBox)
        last_data = buffer[-1]
        bbox = last_data.get("bbox", [0, 0, 0, 1])
        w, h = (bbox[2] - bbox[0]), (bbox[3] - bbox[1])
        rel_velocity = np.mean(velocities)
        
        # A. SITTING / STANDING (Static Ratio)
        if h > 0:
            if (w / h) > 0.9 and rel_velocity < 20:
                anomalies.append({
                    "type": "sitting",
                    "severity": "info",
                    "description": "🪑 SITTING: Subject is in a seated position."
                })
            elif (w / h) < 0.7 and rel_velocity < 20:
                anomalies.append({
                    "type": "standing",
                    "severity": "info",
                    "description": "🚶 STANDING: Subject is standing stationary."
                })
        
        # B. WALKING (Kinetic check)
        if 20 < rel_velocity < 100:
            anomalies.append({
                "type": "walking",
                "severity": "info",
                "description": "🚶 WALKING: Subject is moving at a normal pace."
            })


        # 2. SUSTAINED HIGH VELOCITY (Aggressive Running)
        if rel_velocity > 250 and np.std(velocities) < 80:
            anomalies.append({
                "type": "aggressive_running",
                "severity": "high",
                "description": "🚨 AGGRESSIVE RUNNING: Sustained high-speed movement detected!"
            })

        # 3. SUDDEN DROP (Fall Verification via Sequence)
        y_pos = [b.get("bbox", [0,0,0,0])[3] for b in buffer] # Bottom coord
        if len(y_pos) >= 5: # Faster check
            delta_y = y_pos[-1] - y_pos[0]
            if delta_y > (h * 0.5) and h > 0 and (w / h) > 1.5:
                anomalies.append({
                    "type": "sustained_fall",
                    "severity": "critical",
                    "description": "🚨 CRITICAL: Sequence analysis confirms a rapid human collapse!"
                })

        # 4. ERRATIC MOVEMENT (Potential Conflict/Fighting)
        if len(velocities) >= 5:
            accel = np.diff(velocities)
            if np.max(np.abs(accel)) > 200:
                anomalies.append({
                    "type": "erratic_behavior",
                    "severity": "medium",
                    "description": "⚡ ERRATIC BEHAVIOR: Sudden bursts of erratic movement detected!"
                })

        # 5. PACING (Suspicious Loitering)
        centers = [b.get("center", [0, 0]) for b in buffer]
        if len(centers) >= 10:
            x_centers = [c[0] for c in centers]
            x_diff = np.diff(x_centers)
            direction_changes = np.sum(np.diff(np.sign(x_diff + 1e-6)) != 0)
            if direction_changes > 3 and rel_velocity > 30:
                anomalies.append({
                    "type": "pacing",
                    "severity": "medium",
                    "description": "👀 SUSPICIOUS: Subject is actively pacing back and forth."
                })

        # 6. CROUCHING / HIDING 
        heights = [(b.get("bbox", [0,0,0,0])[3] - b.get("bbox", [0,0,0,0])[1]) for b in buffer]
        if heights[0] > 0 and np.mean(heights[-3:]) / heights[0] < 0.60:
            if h > 0 and (w / h) < 1.2:
                anomalies.append({
                    "type": "crouching",
                    "severity": "high",
                    "description": "🕵️ CROUCHING: Subject dropped elevation/attempting to hide!"
                })

        # 7. VAULTING / JUMPING
        if len(y_pos) >= 5:
            jump_delta = y_pos[-1] - y_pos[0]
            if jump_delta < -120:
                anomalies.append({
                    "type": "vaulting",
                    "severity": "high",
                    "description": "🏃‍♂️ VAULTING: Rapid elevation gain detected (Climbing/Jumping)!"
                })

        # 8. SUSPICIOUS APPROACH (Moving rapidly towards camera)
        areas = [max(1, (b.get("bbox", [0,0,0,1])[2] - b.get("bbox", [0,0,0,1])[0]) * (b.get("bbox", [0,0,0,1])[3] - b.get("bbox", [0,0,0,1])[1])) for b in buffer]
        if len(areas) >= 5 and (areas[-1] / areas[0]) > 2.5 and rel_velocity > 50:
            anomalies.append({
                "type": "rapid_approach",
                "severity": "high",
                "description": "⚠️ APPROACH: Subject is rapidly advancing towards the camera!"
            })

        # 9. POSE-BASED ACTIONS (Waving, Hands-on-Head, Phoning)
        keypoints_buffer = [b.get("keypoints") for b in buffer if b.get("keypoints") is not None]
        if len(keypoints_buffer) >= 3:
            kp = np.array(keypoints_buffer[-1])
            if kp.shape == (17, 3):
                nose = kp[0]
                l_ear, r_ear = kp[3], kp[4]
                l_shoulder, r_shoulder = kp[5], kp[6]
                l_wrist, r_wrist = kp[9], kp[10]
                shoulder_width = abs(l_shoulder[0] - r_shoulder[0]) + 1
                head_threshold = shoulder_width * 0.5
                
                # A. HAND ON HEAD
                if l_wrist[2] > 0.4 and r_wrist[2] > 0.4:
                    if l_wrist[1] < l_shoulder[1] and r_wrist[1] < r_shoulder[1]:
                        d_l = np.sqrt((l_wrist[0]-nose[0])**2 + (l_wrist[1]-nose[1])**2)
                        d_r = np.sqrt((r_wrist[0]-nose[0])**2 + (r_wrist[1]-nose[1])**2)
                        if d_l < head_threshold and d_r < head_threshold:
                            anomalies.append({
                                "type": "hands_on_head",
                                "severity": "high",
                                "description": "🚨 DISTRESS: Subject has hands on head (potential panic)."
                            })

                # B. WAVING
                wrists_y = [k[9][1] if k[9][2] > 0.4 else (k[10][1] if k[10][2] > 0.4 else 999) for k in keypoints_buffer]
                shoulders_y = [k[5][1] for k in keypoints_buffer if k[5][2] > 0.4]
                if shoulders_y and any(y < np.mean(shoulders_y) for y in wrists_y if y != 999):
                    wrists_x = [k[9][0] if k[9][2] > 0.4 else (k[10][0] if k[10][2] > 0.4 else 999) for k in keypoints_buffer]
                    wrists_x = [x for x in wrists_x if x != 999]
                    if len(wrists_x) > 3:
                        x_diff = np.diff(wrists_x)
                        direction_changes = np.sum(np.diff(np.sign(x_diff + 1e-6)) != 0)
                        if direction_changes >= 1:
                            anomalies.append({
                                "type": "waving",
                                "severity": "info",
                                "description": "👋 WAVING: Subject is signalling the camera."
                            })

                # C. PHONING
                if (l_wrist[2] > 0.5 and np.sqrt((l_wrist[0]-l_ear[0])**2 + (l_wrist[1]-l_ear[1])**2) < head_threshold) or \
                   (r_wrist[2] > 0.5 and np.sqrt((r_wrist[0]-r_ear[0])**2 + (r_wrist[1]-r_ear[1])**2) < head_threshold):
                    anomalies.append({
                        "type": "phoning",
                        "severity": "info",
                        "description": "📱 PHONING: Subject is using a mobile device."
                    })

        # 10. SUDDEN STOP
        if len(velocities) >= 5:
            # Check for sudden massive deceleration to near zero
            if velocities[-3] > 80 and velocities[-1] < 10:
                anomalies.append({
                    "type": "sudden_stop",
                    "severity": "info",
                    "description": "🛑 SUDDEN STOP: Subject came to a rapid halt."
                })

        # 11. LINE CROSSING (Configurable Zone Breach)
        # Using Config.RESTRICTED_ZONE_Y as a 'tripwire'
        if len(y_pos) >= 2:
            prev_y, curr_y = y_pos[-2], y_pos[-1]
            tripwire = Config.RESTRICTED_ZONE_Y * Config.FRAME_HEIGHT
            if prev_y < tripwire <= curr_y: # Moving DOWNwards (into restricted zone)
                anomalies.append({
                    "type": "line_crossing",
                    "severity": "high",
                    "description": "🚧 LINE CROSSING: Subject breached Restricted Sector Tripwire!"
                })

        return anomalies

    def analyze_multi_subject(self, camera_id, person_data_map):
        """
        Advanced Interaction Intelligence:
        Identifies 'Following' or 'Stalking' behavior across multiple subjects.
        """
        anomalies = []
        track_ids = list(person_data_map.keys())
        if len(track_ids) < 2: return anomalies

        for i in range(len(track_ids)):
            for j in range(i + 1, len(track_ids)):
                id1, id2 = track_ids[i], track_ids[j]
                
                # Retrieve buffers
                b1 = list(self.memory.get(camera_id, {}).get(id1, []))
                b2 = list(self.memory.get(camera_id, {}).get(id2, []))
                
                if len(b1) < 10 or len(b2) < 10: continue
                
                # Check for Trajectory Correlation (Following)
                # If Subject 2 is behind Subject 1 and following their path
                p1 = [d.get("center") for d in b1]
                p2 = [d.get("center") for d in b2]
                
                # Simple distance check for persistent 'shadowing'
                current_dist = np.sqrt((p1[-1][0]-p2[-1][0])**2 + (p1[-1][1]-p2[-1][1])**2)
                prev_dist = np.sqrt((p1[0][0]-p2[0][0])**2 + (p1[0][1]-p2[0][1])**2)
                
                # If they maintain a distance of 100-300px for 10 frames while moving
                v1 = b1[-1].get("velocity", 0)
                v2 = b2[-1].get("velocity", 0)
                
                if 80 < current_dist < 300 and abs(current_dist - prev_dist) < 50 and v1 > 30 and v2 > 30:
                     anomalies.append({
                        "type": "following",
                        "severity": "medium",
                        "description": f"🚶‍♂️ FOLLOWING: Subject {id2} appears to be shadowing Subject {id1}!",
                        "track_id": id2
                    })
        
        return anomalies

# Global Singleton
sentry_lstm = SequenceBehaviorService()
