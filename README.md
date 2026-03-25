# 🛡️ SentinelVision — AI-Powered Smart Surveillance System

> **Advanced real-time AI surveillance providing actionable threat intelligence through computer vision and behavioral analysis.**

SentinelVision is a high-performance, enterprise-ready surveillance dashboard that leverages YOLOv8 deep learning and OpenCV to detect weapons, monitor behavior, and provide instantaneous alerts across various camera inputs.

---

## 🏗️ System Architecture

 SentinelVision follows a modular decoupled architecture for maximum stability and speed:

```text
[Camera Inputs] (USB / RTSP / Virtual)
        ↓
[Edge Processing Node]
  ├── (OpenCV Stream Manager)
  └── (YOLOv8 Object Detection Engine)
        ↓ (Real-time Frames + JSON Metadata)
[Backend Orchestrator (Flask + SocketIO)]
  ├── (Database Layer: SQLite3)
  └── (Rules Engine: Behavioral Analysis)
        ↓ (WebSocket Signals)
[React Dashboard (Vite)]
  └── (Glassmorphic UI / Real-time HUD)
```

---

## ⚡ Technical Core

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Premium Dark Mode Dashboard |
| **Backend** | Flask | Central API Service |
| **Real-time** | Socket.IO | Ultra-low latency video & alert delivery |
| **AI Brain** | Ultralytics YOLOv8 | Person & Weapon Detection |
| **Database** | SQLite3 | Local storage for events & camera configs |
| **Imaging** | OpenCV | Frame processing & Base64 encoding |

---

## 🚀 Optimized for Performance

The system has been meticulously tuned for standard laptop processors to provide a professional experience without lag:

- **15 FPS Target:** High-fluidity live video streams.
- **Inference Throttling:** AI runs at 3Hz (detects threats 3 times per second) to keep the CPU cool.
- **Dynamic Resolution:** Scans at 320px-480px to maximize detection speed.
- **Async Processing:** Computer vision and frame streaming run on independent background threads.

---

## 🎯 Intelligent Features

### 🔍 Precision Detection
- **Human Monitoring:** Tracks multiple persons simultaneously.
- **Weapon Identification:** Instant recognition of Knives and Scissors with a sensitive 25% confidence floor.
- **Source Selection:** Built-in dropdown to toggle between **PC Integrated Camera** and 📱 **Iriun Webcam** (Index 0, 1, 2).

### 🚨 Behavioral Rules Engine
- **Loitering:** Detects individuals stationary for more than 60 seconds.
- **High-Velocity Alert:** Identifies "running" behavior through centroid tracking.
- **Crowd Detection:** Monitors for unauthorized gatherings (5+ people).
- **Incident Throttling:** Smart logic prevents the dashboard from being flooded with duplicate alerts.

### 🛡️ Dashboard Experience
- **Real-time HUD:** Overlaying bounding boxes and scan-lines.
- **Live Alert Feed:** Categorized by severity (Critical, High, Medium, Low).
- **Historic Event Log:** Full persistence of detections for forensic review.
- **Active Stats:** Real-time counters for active cameras, total events, and current session threats.

---

## 🛠️ Ready to Launch

### 1. Requirements
- Python 3.11 or higher
- Node.js 18 or higher

### 2. Startup (Backend)
```bash
cd backend
python -m venv venv
# Activate venv followed by:
pip install -r requirements.txt
python app.py
```
> Server launches at **http://localhost:5000**

### 3. Startup (Frontend)
```bash
cd frontend
npm install
npm run dev
```
> Dashboard launches at **http://localhost:3000**

---

## 🔐 Credentials
- **Default Admin:** `admin`
- **Password:** `admin123`

---

## 📄 License
MIT License — 2026 SentinelVision Engineering Team.
