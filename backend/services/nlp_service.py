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
            b_type = b["type"]
            if b_type in ["fall_detected", "sustained_fall"]:
                summary_parts.append("A potential medical emergency (individual down) is detected.")
            elif b_type == "intrusion":
                summary_parts.append("Unauthorized breach of the restricted security zone recorded.")
            elif b_type == "fight_detected":
                summary_parts.append("🥊 CRITICAL: Violent physical conflict/fighting detected between subjects.")
            elif b_type == "waving":
                summary_parts.append("Subject is actively waving hands, signalling the camera.")
            elif b_type == "hands_on_head":
                summary_parts.append("Subject is exhibiting distress/panic posture (hands on head).")
            elif b_type == "phoning":
                summary_parts.append("Subject is currently using a mobile phone.")
            elif b_type == "crouching":
                summary_parts.append("Subject is detected in a suspicious/crouched posture.")
            elif b_type == "rapid_approach":
                summary_parts.append("⚠️ Subject is rapidly advancing directly towards the camera lens.")
            elif b_type == "abandoned_object":
                summary_parts.append("📦 A package/bag has been left unattended in a high-security area.")

        summary = " ".join(summary_parts) if summary_parts else "Routine movement detected in surveillance area."

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
