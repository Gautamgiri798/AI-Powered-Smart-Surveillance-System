# 🛡️ SENTINEL VISION V8.4.2
## High-Fidelity Human Action Recognition (HAR) & Threat Intelligence Engine

![Sentinel Vision Hero](file:///C:/Users/gauta/.gemini/antigravity/brain/3bc25aeb-8c36-41ee-919a-86b6682d0e2e/sentinel_vision_hero_1774869711674.png)

**Sentinel Vision** is a state-of-the-art, dual-engine AI surveillance system designed for proactive security and forensic human behavior analysis. By combining high-speed object detection with real-time skeletal pose estimation, the system transforms standard CCTV feeds into high-fidelity investigative data.

---

### 🚀 Core AI Architecture & Models
The system utilizes a **Multi-Stage Inference Pipeline** optimized for edge hardware:

*   **Dual-Engine Pass:** Simultaneous execution of two high-performance models:
    *   **`yolov8s_openvino_model`**: Optimized for broad environmental object detection (weapons, suitcases, vehicles).
    *   **`yolov8s-pose_openvino_model`**: Specialized for high-precision human skeletal tracking (17 keypoints).
*   **12Hz Action Pipeline:** Advanced inference sampling at **~80ms latency**, enabling the system to capture rapid human actions without frame-skip.
*   **Sentry-LSTM Temporal Memory:** A sliding-window behavior classifier that analyzes movement history to distinguish complex behavioral patterns.

---

### 📊 Dynamic Activity Matrix (HAR Classifier)
Our proprietary **Human Action Recognition** engine groups behaviors into professional security divisions:

| Category | Monitored Activities |
| :--- | :--- |
| **📉 BASIC** | 🚶 Standing, 🪑 Sitting, 🚶 Walking (Postural analysis) |
| **⚡ MOVEMENT** | 🏃 Running, 🛑 Sudden Stop, ⚠️ High Velocity |
| **🕐 TIME-BASED** | 🕐 Loitering, 💤 Idle, 👤 Stationary Detection |
| **🚧 ZONE-BASED** | ⛔ Intrusion, 🚧 Tripwire/Line Crossing (Restricted breach) |
| **🔪 SUSPICIOUS** | 🔪 Weapon Use, 🎒 Abandoned Object, 🎒 Unattended Luggage |
| **🥊 INTERACTION** | 🥊 Fight Detected, 👥 Crowd Density, 🚶‍♂️🚶‍♂️ Following/Stalking |
| **🏋️ POSE_BASED** | 🚨 Fall (Human collapse), 👋 Waving, 🚨 Distress (Hands-on-Head) |
| **📱 CONTEXTUAL** | 📱 Smartphone Usage (Object matching), 🌙 Night Activity (22:00-05:00) |

---

### 🛠️ Technology Stack

**Backend Mission Core:**
- **Language:** Python 3.10+
- **Computer Vision:** OpenCV (Inference + Post-processing)
- **AI Framework:** Ultralytics YOLOv8 (OpenVINO optimized)
- **Streaming:** WebSockets (Flask-SocketIO) for <100ms video telemetry
- **Database:** SQLite3 with WAL mode for high-frequency event logging
- **Multimodal AI:** Custom NLP Scene Briefing Engine

**Tactical Frontend:**
- **Framework:** React 18+
- **Build Tool:** Vite (Ultra-fast HMR)
- **Styling:** Vanilla CSS3 (Custom Glass-Design System), Tailwind (Utilities)
- **Icons:** Lucide React
- **State Management:** React Hooks + Socket.IO-client

---

### 📂 Project Structure

```text
SENTINEL-VISION/
├── backend/
│   ├── app.py                  # Mission Core Entry Point
│   ├── config.py               # Global AI Thresholds & Security Params
│   ├── services/
│   │   ├── detection_service.py# Dual-Engine AI Inference (YOLO + Pose)
│   │   ├── behavior_service.py # High-Level Heuristics & Activity Logic
│   │   ├── sequence_service.py # Sentry-LSTM Temporal Sequence Analysis
│   │   ├── tracking_service.py # Subject ID Persistence & Velocity Analysis
│   │   ├── video_service.py    # Multi-threaded Stream Processing
│   │   └── alert_service.py    # DB Persistence & Trigger Dispatch
│   ├── models/                 # AI Model Registries
│   └── utils/                  # Thermal/CLAHE Image Pre-processors
├── frontend/
│   ├── src/
│   │   ├── components/         # Glassmorphic UI Library (Dashboard, Grid, etc.)
│   │   ├── hooks/              # missions hooks (useSocket)
│   │   └── services/           # API Proxies
│   └── public/                 # Mission Assets
└── reports/                    # Generated Incident Forensic Briefings
```

---

### 💎 Key Experience Features
*   **Tactical Glassmorphic Dashboard:** A premium, dark-mode React interface.
*   **Multimodal Scene Briefing:** NLP-powered forensic reports that narrate the scene.
*   **Instant Threat Response:** Real-time visual and auditory alerts.
*   **Edge Optimization:** Optimized for **OpenVINO CPU** inference.

---

### 📥 Rapid Deployment

1.  **Clone & Initialize:**
    ```bash
    git clone https://github.com/Gautamgiri798/AI-Powered-Smart-Surveillance-System.git
    cd AI-Powered-Smart-Surveillance-System
    ```

2.  **Backend Setup:**
    ```bash
    cd backend
    pip install -r requirements.txt
    python app.py
    ```

3.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

---

<div align="center">
  <sub>Developed for the Comprehensive Seminar on AI-Powered Smart Surveillance.</sub><br/>
  <strong>🛡️ MISSION_SECURE // BIO_METRIC_ENGINE_NOMINAL // V8.4.2</strong>
</div>
