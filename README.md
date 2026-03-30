# 🛡️ SENTINEL VISION V8.4.2
## High-Fidelity Human Action Recognition (HAR) & Threat Intelligence Engine

![Sentinel Vision Hero](file:///C:/Users/gauta/.gemini/antigravity/brain/3bc25aeb-8c36-41ee-919a-86b6682d0e2e/sentinel_vision_hero_1774869711674.png)

**Sentinel Vision** is a state-of-the-art, dual-engine AI surveillance system designed for proactive security and forensic human behavior analysis. By combining high-speed object detection with real-time skeletal pose estimation, the system transforms standard CCTV feeds into high-fidelity investigative data.

---

### 🚀 Core AI Architecture
The system utilizes a **Multi-Stage Inference Pipeline** optimized for high-velocity action recognition on local edge hardware:

*   **Dual-Engine Pass:** Simultaneous execution of `YOLOv8s-Detection` (for environment threats) and `YOLOv8s-Pose` (for human skeletal tracking).
*   **12Hz Action Pipeline:** Advanced inference sampling at **~80ms latency**, enabling the system to capture rapid human actions (waving, phoning, falling) without frame-skip.
*   **Sentry-LSTM Temporal Memory:** A sliding-window behavior classifier that analyzes 10+ frames of movement history to distinguish between "Standing" and "Sitting", or "Walking" and "Pacing".

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

### 💎 Key Features & Experience
*   **Tactical Glassmorphic Dashboard:** A premium, dark-mode React interface featuring a real-time behavioral feed and a live "Dynamic Activity Matrix".
*   **Multimodal Scene Briefing:** NLP-powered forensic reports that narrate the scene in human-readable tactical investigative briefings.
*   **Instant Threat Response:** Real-time visual and auditory alerts (Intrusion/Weapon) with millisecond-grade event logging.
*   **Low-Level Portability:** Optimized for **OpenVINO CPU** inference, enabling high-performance AI deployment on standard laptops and NVRs without expensive GPUs.

---

### 🛠️ Hardware & Tech Stack
*   **Backend:** Python 3.10+, Flask, Socket.IO, OpenCV, Ultralytics YOLOv8
*   **AI Engine:** OpenVINO Optimized (Pose + Detection)
*   **Frontend:** React, Tailwind Glass-CSS, Framer Motion, Lucide Icons
*   **Database:** SQLite3 / MongoDB Interaction logs

---

### 📥 Rapid Deployment

1.  **Clone & Initialize:**
    ```bash
    git clone https://github.com/Gautamgiri798/Sentinel-Vision.git
    cd Sentinel-Vision
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
  <strong>🛡️ MISSION_SECURE // BIO_METRIC_ENGINE_NOMINAL</strong>
</div>
