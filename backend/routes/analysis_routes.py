from flask import Blueprint, request, jsonify, send_from_directory, current_app
import os
from services.analysis_service import VideoAnalysisService

analysis_bp = Blueprint("analysis", __name__)
analysis_service = VideoAnalysisService()

@analysis_bp.route("/api/analysis/upload", methods=["POST"])
def upload_and_analyze():
    """
    Accepts a video file, runs detection, and returns the JSON summary + report URL.
    """
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400
        
    video_file = request.files["video"]
    # Secure the filename and save to an absolute mission path
    filename = os.path.basename(video_file.filename)
    video_path = os.path.abspath(os.path.join(analysis_service.upload_folder, filename))
    print(f"[ANALYSIS] 📥 Receiving mission clip: {filename} -> {video_path}")
    video_file.save(video_path)
    
    # Process the mission telemetry
    print(f"[ANALYSIS] 🧠 Initializing situational deep scan...")
    result = analysis_service.analyze_video(video_path)

    
    if not result:
        return jsonify({"error": "Failed to analyze video"}), 500
        
    # Return the summary and the URL where the CSV can be fetched
    return jsonify({
        "status": "success",
        "message": "AI Deep Scan Completed",
        "data": result
    })

@analysis_bp.route("/static/reports/<path:filename>")
def download_report(filename):
    """Serve generated reports."""
    reports_dir = os.path.join(current_app.root_path, "static", "reports")
    return send_from_directory(reports_dir, filename)
