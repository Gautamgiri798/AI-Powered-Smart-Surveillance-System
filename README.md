<div align="center">
  <img src="https://img.shields.io/badge/SENTINEL-CORE_ENGINE_V8.4-0f172a?style=for-the-badge&logo=shield&logoColor=3b82f6" alt="Sentinel Core" />
  <h1>🛡️ AI-Powered Smart Surveillance System</h1>
  <p><strong>Next-Generation Multimodal Behavioral Intelligence & Threat Detection</strong></p>

  [![Python](https://img.shields.io/badge/Python-3.9+-blue?logo=python&logoColor=white)](#)
  [![React](https://img.shields.io/badge/React-18+-61dafb?logo=react&logoColor=black)](#)
  [![Vite](https://img.shields.io/badge/Vite-6.4+-646cff?logo=vite&logoColor=white)](#)
  [![YOLOv8](https://img.shields.io/badge/YOLOv8-OpenVINO-ff7043?logo=openvino&logoColor=white)](#)
  [![Flask](https://img.shields.io/badge/Flask%20SocketIO-Socket%20Eventing-black?logo=flask&logoColor=white)](#)
</div>

---

## 📖 Mission Overview
**Sentinel** is an enterprise-grade AI video analytics dashboard designed to process autonomous threat detection, real-time behavioral insights, and situational forensic monitoring across multi-camera setups. Engineered with the **YOLOv8 Object & Pose Models** running parallel via **OpenVINO Hardware Acceleration**, it provides rapid zero-latency inference for robust security deployments.

---

## ⚡ Core Capabilities

### 1. 👁️ Tactical Object & Threat Detection
* **Real-time Target Tracking:** Uses `yolov8s.pt` to autonomously classify and track entities. 
* **Weapon Recognition Matrices:** Explicit configurations to identify threats holding sharp or blunt objects (e.g., Knives, Baseball Bats, Scissors).
* **Multi-Camera Indexing:** Seamlessly bind virtual camera streams (e.g., iOS via Iriun Webcam) or hardware RTSP nodes directly to the dashboard GUI.

### 2. 🏃 Behavioral Intelligence Analysis
* **Granular Posture Assessment:** Utilizes `yolov8s-pose.pt` keypoints to precisely deduce subject states (`STANDING`, `SITTING`, `WALKING`, `RUNNING`).
* **Complex Object Interaction:** Evaluates intersecting bounding boxes to determine situational actions (e.g., *Subject Holding Object*, *Subject Using Phone*).
* **Anomalous Behavioral Triggers:** Dynamic loitering detection and fallen-person indicators (`POSTURE ANOMALY / PERSON DOWN`).

### 3. 📡 Mission Control Interface (Vite/React)
* **High-Fidelity Dashboard:** React-driven terminal UI utilizing a sleek tactical cyber-aesthetic with live WebSocket telemetry.
* **Granular Forensic Event Logs:** Local SQLite 3 backing allowing you to permanently filter, acknowledge, or purge historical records.
* **NLP Intelligence Briefings:** An intelligent text parser that converts raw bounding box data into human-readable situational logs (e.g., *"1 Subject detected near right border holding a phone"*).

---

## 🛠️ Technology Stack

**Frontend (Client Node)**
* Framework: `React 18` + `Vite`
* Communication: `Socket.IO-Client`
* UI Icons & Graphics: `Lucide React`

**Backend (AI Engine)**
* Framework: `Flask` + `Flask-SocketIO`
* Database: `SQLite3`
* Computer Vision: `OpenCV` + `Ultralytics (YOLOv8)`
* Acceleration: `Intel OpenVINO` Framework

---

## 🚀 Deployment Protocols

### Prerequisites
* Python 3.9+
* Node.js v18+
* Minimum 8GB RAM + Multi-core CPU (For OpenVINO execution)

### 1. Initialize the Core Engine (Backend)
Navigate to the `backend` directory and install the necessary dependencies:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Launch the Application Server:
```bash
python app.py
```
*The database (`safetysnap.db`) will auto-initialize alongside the YOLO weights on your first run.*

### 2. Initiate the Mission Dashboard (Frontend)
Open a new terminal session, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:3000/` in your browser.

---

## 🎮 Interface Controls

1. **Dashboard Overview:** Monitor total events, active cameras, missing persons, and critical threats.
2. **Camera Source Management:** Bind new feeds or toggle streams via the left-side `CAMERAS` tab.
3. **Live Alert Logging:** The `ALERTS` and right-panel module captures behaviors to your permanent disk. Navigate to `EVENTS` to filter intel by severity thresholds.
4. **Data Purging:** Administrative functionality available to hard-delete active SQLite forensic traces using `PURGE LOGS`.

---

## 🚨 Troubleshooting & Diagnostics
* **System Camera Conflicts:** If hooking external USB / Phone systems (Iriun Webcam) results in swapped views, utilize the explicit `swap_cams.py` or modify the camera array via the UI.
* **Ports Blocked / Dashboard says System Offline:** Ensure there are no zombie Python background processes. Force quit Python `taskkill /F /IM python.exe` and reboot `app.py`.
* **Zero Frame Emissions:** Verify no other application is seizing generic control over `/dev/video0` or `COM` port cameras causing `cv2.VideoCapture()` blackouts.
