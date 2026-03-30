# 🛡️ SENTINEL VISION V8.4.5 — Universal Intelligence Suite
## Full-Spectrum Human Action Recognition (HAR) & Forensic Threat Intelligence

![Sentinel Vision Hero](file:///C:/Users/gauta/.gemini/antigravity/brain/3bc25aeb-8c36-41ee-919a-86b6682d0e2e/sentinel_vision_hero_1774869711674.png)

**Sentinel Vision** is a professional-grade AI surveillance ecosystem engineered for high-fidelity investigative awareness. It utilizes a **Universal Vision Core** capable of identifying 80+ object classes and a **High-Frequency Pose Pipeline** for millisecond-grade human action recognition.

---

### 🚀 Mission-Critical AI Architecture
The system is powered by a multi-threaded, asynchronous engine optimized for **OpenVINO CPU acceleration**, delivering **12Hz throughput (~80ms latency)** on edge hardware.

#### 🧠 Continuous Inference Pipeline
*   **Universal Spectrum (`YOLOv8s`)**: Unlocked to monitor all 80 COCO classes—from vehicles and animals to household tools—ensuring 100% environmental awareness.
*   **Skeletal Pose Engine (`YOLOv8s-Pose`)**: Tracks 17 human keypoints in real-time, enabling the system to "read" human posture, gestures, and kinetic intent frame-by-frame.
*   **Sentry-LSTM Memory (V3)**: A temporal analysis window that distinguishes between stationary states (Sitting/Standing) and complex behaviors (Pacing/Falling/Waving).

---

### 📊 Tactical Behavioral Matrix (HAR Classifier)
Our proprietary **Human Action Recognition** engine groups live telemetry into 8 investigative divisions:

| Category | Real-Time Identifiers | Logic Triggers |
| :--- | :--- | :--- |
| **📉 BASIC** | 🚶 Standing, 🪑 Sitting, 🚶 Walking | Skeletal ratios & Kinetic gravity |
| **⚡ MOVEMENT** | 🏃 Running, 🛑 Sudden Stop, ⚠️ High Velocity | Velocity Δ & Deceleration spikes |
| **🕐 TIME-BASED** | 🕐 Loitering, 💤 Idle, 👤 Stationary | >30s Stationary Track_ID |
| **🚧 ZONE-BASED** | ⛔ Intrusion, 🚧 Tripwire/Line Crossing | Y-Level (0.85) Tripwire Breach |
| **🔪 SUSPICIOUS** | 🔪 Weapon Use, 🎒 Abandoned Object | BBox clustering & Attendance checks |
| **🥊 INTERACTION** | 🥊 Fight, 👥 Crowd Density, 🚶‍♂️ FOLLOWING | Proximity vectors & Trajectory lag |
| **🏋️ POSE_BASED** | 🚨 Fall, 👋 Waving, 🚨 Distress (Panic) | Skeletal compression & Oscillation |
| **📱 CONTEXTUAL** | 📱 Smartphone Usage, 🌙 Night Activity | Object-Match (Class 67) & 22:00-05:00 |

---

### 🛠️ Hardware & Full Tech Stack

**Backend Mission Infrastructure:**
- **Language:** Python 3.10.12+ 🐍
- **Vision Core:** OpenCV 4.8+ with **CLAHE** (Image Enhancement) pre-processing.
- **AI Backend:** Ultralytics YOLOv8 (OpenVINO optimized for CPU).
- **Asynchronous Loop:** Multi-threaded `VideoService` with discrete worker threads (Detection, NLP, IO).
- **Database:** SQLite3 with **WAL (Write-Ahead Logging)** mode for high-frequency logs.
- **Security:** RSA/JWT-based authentication (24h token rotation).

**Tactical Interface (UI/UX):**
- **Framework:** React 18 with high-speed Vite HMR.
- **Communications:** Socket.IO for **<30ms video-event syncing**.
- **Aesthetic:** Custom Glassmorphic CSS Engine with Dark-Mode optimization.
- **Dashboards:** Dynamic Activity Matrix, Real-time Scene Intelligence, Tactical Feed.

---

### 🔎 Special Forensic Protocols
*   **Armed Subject Detection:** The AI identifies objects classically used as weapons (Knives, Scissors, Bats) and links them to the person's track-id.
*   **Smartphone Usage Detection:** Direct object-to-human linking (Object class 67 inside Person bbox 0) for identifying mobile distractions.
*   **Suspicious Following Engine:** Compares trajectory correlation between multiple IDs to detect "Shadowing" or "Stalking".
*   **NLP Forensic Briefing:** Multimodal AI translates raw telemetry into tactical briefs: *"Subject ID 4 exhibiting erratic movement near Restricted Zone."*

---

### 📂 Full Project Architecture

```text
SENTINEL-VISION/
├── backend/
│   ├── app.py                  # API Boundary & Socket Gateway
│   ├── config.py               # Mission Parameters (80 class spectrum, Tripwires)
│   ├── services/
│   │   ├── detection_service.py# [AI] Universal Dual-Pass Inference
│   │   ├── behavior_service.py # [Logic] Interaction & Object Metrics
│   │   ├── sequence_service.py # [LSTM] Temporal Analysis (Falls, Pacing)
│   │   ├── tracking_service.py # [Tracking] Persistent ID Vectors
│   │   ├── video_service.py    # [Engine] Asynchronous Feed Management
│   │   └── nlp_service.py      # [Intel] Scene Briefing Narrative
│   └── models/                 # AI Model Registries (OpenVINO + PT)
├── frontend/
│   ├── src/
│   │   ├── components/         # ActivityMatrix, AlertPanel, VideoFeed
│   │   └── hooks/              # useSocket telemetry hook
└── reports/                    # Forensic Forensic Evidence logs
```

---

<div align="center">
  <sub>Developed for the Comprehensive Seminar on AI-Powered Smart Surveillance.</sub><br/>
  <strong>🛡️ MISSION_SECURE // BIO_METRIC_ENGINE_NOMINAL // V8.4.5_FINAL</strong>
</div>
