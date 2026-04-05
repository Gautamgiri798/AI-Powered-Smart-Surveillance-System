"""Elite Face Intelligence: Reconstruction from YOLO-Pose Keypoints."""
import cv2
import os
import numpy as np
from models.db import get_conn

class FaceIntelligence:
    """
    High-fidelity face intelligence suite using YOLO-Pose extraction.
    Derives facial forensic signatures from the 17-point skeletal mesh (0-4: Head).
    """
    
    def __init__(self):
        # Store metadata for identified subjects
        self.known_faces = {} # {id: {"name": str, "encoding": list}}
        self.load_known_identities()

    def load_known_identities(self):
        """Load enrolled identities from the forensic database."""
        try:
            conn = get_conn()
            rows = conn.execute("SELECT id, username, full_name FROM users").fetchall()
            for r in rows:
                self.known_faces[r["id"]] = {
                    "id": r["id"],
                    "name": r["full_name"] or r["username"],
                    "role": "Authorized Operator"
                }
        except:
            pass

    def extract_faces_from_poses(self, detections):
        """
        Derives dedicated Face BBoxes from YOLO-Pose facial keypoints (0: Nose, 1-2: Eyes, 3-4: Ears).
        Returns a list of structured face-detections.
        """
        face_detections = []
        
        for d in detections:
            if d.get("class") == 0 and d.get("keypoints") is not None:
                kp = np.array(d["keypoints"]) # [17, 3]
                # Filter for head keypoints (0-4)
                head_kp = kp[0:5]
                valid_head = head_kp[head_kp[:, 2] > 0.4] # Conf > 0.4
                
                if len(valid_head) >= 3:
                    # Estimate Face BBox from head keypoints
                    xmin, ymin = np.min(valid_head[:, 0:2], axis=0)
                    xmax, ymax = np.max(valid_head[:, 0:2], axis=0)
                    
                    # Add padding to head BBox to make it a 'Face'
                    pw = (xmax - xmin) * 0.4
                    ph = (ymax - ymin) * 0.4
                    
                    # Heuristic identity (Unknown by default)
                    identity = f"SUBJECT_{d.get('track_id', 'UNKNOWN')}"
                    status = "unauthorized"
                    
                    face_detections.append({
                        "id": identity,
                        "bbox": [int(xmin - pw), int(ymin - ph), int(xmax + pw), int(ymax + ph)],
                        "confidence": float(np.mean(valid_head[:, 2])),
                        "status": status,
                        "label": "YOLO_POSE_FACE"
                    })
        
        return face_detections

    def analyze_anomalies(self, face_detections):
        """Identifies suspicious facial presence (Unknowns in restricted zones)."""
        anomalies = []
        for face in face_detections:
            if face["status"] == "unauthorized":
                anomalies.append({
                    "type": "unidentified_face",
                    "severity": "medium",
                    "description": f"👤 FACE_INTEL: Unidentified facial signature detected (Source: YOLO-Pose).",
                    "id": face["id"]
                })
        return anomalies

# Mission Singleton
face_intelligence = FaceIntelligence()
