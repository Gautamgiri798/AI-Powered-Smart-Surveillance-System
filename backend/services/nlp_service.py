"""Advanced Multimodal AI: Vision + NLP Scene Understanding Service."""
import random
from datetime import datetime

class SceneUnderstandingService:
    """Combines visual detections and behavioral rules into natural language situational reports."""

    def __init__(self):
        self._last_report_hash = None

    def generate_report(self, camera_id: str, camera_name: str, detections: list, behaviors: list) -> dict:
        """
        Synthesizes visual data into a natural language briefing.
        """
        if not detections and not behaviors:
            return {
                "summary": "Observation post clear. No significant activity detected in this sector.",
                "advisory": "Maintain routine monitoring.",
                "timestamp": datetime.now().strftime("%H:%M:%S")
            }

        person_count = sum(1 for d in detections if d["class"] == 0)
        threats = [d["label"].upper() for d in detections if d.get("is_weapon")]
        critical_behaviors = [b for b in behaviors if b["severity"] == "critical"]
        
        # --- Contextual Summary Engineering ---
        summary_parts = []
        if person_count == 1:
            summary_parts.append("A solitary individual is observed.")
        elif person_count > 1:
            summary_parts.append(f"A group of {person_count} individuals is being monitored.")

        if threats:
            summary_parts.append(f"CRITICAL: {', '.join(threats)} identified within active perimeter.")

        for b in behaviors:
            b_type = b.get("type")
            tid = b.get("track_id", "SYS")
            
            if b_type == "phoning":
                summary_parts.append(f"📱 Subject {tid} is actively using a mobile phone.")
            elif b_type == "dancing":
                summary_parts.append(f"💃 Subject {tid} is exhibiting erratic/rhythmic physical motion (Dancing).")
            elif b_type == "sleeping":
                summary_parts.append(f"💤 Subject {tid} appears stationary in a reclined/seated posture (Potential Sleep).")
            elif b_type == "running":
                summary_parts.append(f"🏃 Subject {tid} is moving at high velocity.")
            elif b_type == "sitting":
                summary_parts.append(f"🪑 Subject {tid} has assumed a seated posture.")
            elif b_type == "standing":
                summary_parts.append(f"🧍 Subject {tid} is in a vertical standing posture.")
            elif b_type in ["fall_detected", "sustained_fall"]:
                summary_parts.append(f"🚑 medical emergency: Subject {tid} is detected down.")
            elif b_type == "intrusion":
                summary_parts.append(f"⛔ Unauthorized access detected by Target {tid}.")
            elif b_type == "abandoned_object":
                summary_parts.append("📦 A suspicious package has been left unattended.")

        summary = " ".join(summary_parts) if summary_parts else "Observation post clear. Operational parameters nominal."

        # --- Multimodal Advisory (The NLP 'Voice') ---
        advisories = []
        if threats:
            advisories.append("CRITICAL THREAT: DEPLOY SECURITY PERSONNEL IMMEDIATELY.")
        elif critical_behaviors:
            advisories.append("HIGH ALERT: Monitor movement closely. Coordinate with local security/medical if situation escalates.")
        elif person_count > 5:
            advisories.append("Monitor mass gathering for potential crowd management requirement.")
        else:
            advisories.append("Scene Secure. All movements within safe behavioral parameters.")

        return {
            "camera_id": camera_id,
            "camera_name": camera_name,
            "summary": summary,
            "advisory": random.choice(advisories),
            "timestamp": datetime.now().strftime("%H:%M:%S"),
            "intel_score": self._calculate_intel_score(person_count, threats, behaviors)
        }

    def _calculate_intel_score(self, person_count, threats, behaviors):
        """Quantifies the 'Scene Understanding' into a situational risk score (0-100)."""
        score = person_count * 2
        if threats: score += 50
        for b in behaviors:
            if b["severity"] == "critical": score += 30
            elif b["severity"] == "high": score += 15
        return min(score, 100)

# Global singleton
scene_engine = SceneUnderstandingService()
