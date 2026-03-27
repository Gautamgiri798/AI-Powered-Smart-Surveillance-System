"""Batch video analysis service for SentinelVision."""
import cv2
import time
import os
import csv
from datetime import datetime
from services.detection_service import detect_objects

class VideoAnalysisService:
    """Headless video processor for batch inference and report generation."""

    def __init__(self, upload_folder="uploads", reports_folder="reports"):
        self.upload_folder = upload_folder
        self.reports_folder = reports_folder
        self.public_reports_folder = "static/reports" # For static download links
        os.makedirs(upload_folder, exist_ok=True)
        os.makedirs(reports_folder, exist_ok=True)
        os.makedirs(self.public_reports_folder, exist_ok=True)

    def analyze_video(self, video_path):
        """
        Processes a video file frame-by-frame (sampled) and generates a detection report.
        
        Returns:
            dict: Summary of detection data and paths.
        """
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None

        fps = cap.get(cv2.CAP_PROP_FPS) or 30
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = frame_count / fps
        
        # Sample 1 frame per second to speed up batch analysis while maintaining precision
        sample_rate = int(fps)
        report_data = []
        summary = {"persons": 0, "weapons": 0, "total_objects": 0}
        
        print(f"[ANALYSIS] 🧪 Starting batch scan: {video_path} ({duration:.1f}s)")
        
        current_frame = 0
        while cap.isOpened():
            cap.set(cv2.CAP_PROP_POS_FRAMES, current_frame)
            ret, frame = cap.read()
            if not ret or frame is None:
                break
            
            # Timestamp relative to video start
            timestamp_sec = current_frame / fps
            timestamp_str = str(datetime.fromtimestamp(timestamp_sec).strftime('%H:%M:%S'))
            
            # Run the AI core
            detections = detect_objects(frame)
            
            # Flatten detections into the report
            for det in detections:
                summary["total_objects"] += 1
                if det["class"] == 0: summary["persons"] += 1
                if det["is_weapon"]: summary["weapons"] += 1

                report_data.append({
                    "Timestamp": timestamp_str,
                    "Object": det["label"].capitalize(),
                    "Confidence": det["confidence"],
                    "Is Weapon": "YES" if det["is_weapon"] else "NO",
                    "Location X": round(det["center"][0], 2),
                    "Location Y": round(det["center"][1], 2)
                })
            
            current_frame += sample_rate
            if current_frame >= frame_count:
                break
                
        cap.release()
        
        # Generate the Report (CSV)
        report_filename = f"report_{int(time.time())}.csv"
        report_path = os.path.join(self.public_reports_folder, report_filename)
        
        keys = ["Timestamp", "Object", "Confidence", "Is Weapon", "Location X", "Location Y"]
        with open(report_path, 'w', newline='') as output_file:
            dict_writer = csv.DictWriter(output_file, fieldnames=keys)
            dict_writer.writeheader()
            dict_writer.writerows(report_data)
            
        print(f"[ANALYSIS] ✅ Report generated: {report_path}")
        
        return {
            "summary": summary,
            "report_url": f"/static/reports/{report_filename}",
            "filename": report_filename,
            "duration": duration
        }
