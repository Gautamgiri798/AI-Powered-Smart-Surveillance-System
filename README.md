# 🛡️ SentinelVision — Advanced Omni-Detection Surveillance

> **The ultimate real-time AI surveillance dashboard. Driven by professional-grade computer vision, high-definition streaming, and omni-directional threat intelligence.**

SentinelVision has evolved into an elite, full-spectrum monitoring system. It leverages the latest **YOLOv8 Medium** neural networks to identify **all 80 standard COCO object categories** across multiple high-definition camera feeds with precision and speed.

---

## 🏗️ System Architecture

SentinelVision utilizes a decoupled, high-throughput architecture designed for zero-latency monitoring:

```text
[High-Def Inputs] (Laptop Webcam / Iriun USB / RTSP)
        ↓
[Advanced Processing Node]
  ├── (CLAHE Video Enhancement)
  ├── (High-Fidelity 720p Pipeline)
  └── (YOLOv8-Medium Inference Engine)
        ↓ (Real-time Frames + Dynamic Metadata)
[Backend Orchestrator (Flask + SocketIO)]
  ├── (Storage: SQLite3 Persistent Logs)
  └── (Intelligence: Behavioral Rules Node)
        ↓ (Multi-stream WebSocket Events)
[Next-Gen Dashboard (React + Vite)]
  ├── (Theater Mode / Grid View)
  └── (Precision HUD / Detection Overlays)
```

---

## ⚡ Technical Core (Advanced Tier)

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React 19 + Vite | Premium Glassmorphic Surveillance UI |
| **Backend** | Flask | Enterprise API & Thread Orchestration |
| **Real-time** | Socket.IO | High-fidelity Base64 frame transmission |
| **AI Brain** | **YOLOv8 Medium** | **25M+ Parameter** Omni-Detection Engine |
| **Vision** | OpenCV + **CLAHE** | Advanced Contrast & Lighting Optimization |
| **Database** | SQLite3 | Real-time Persistence for Forensic Review |

---

## 🚀 Optimized for Intelligence & Accuracy

The system is configured for professional-grade stability on standard hardware:

- **720p High-Definition:** Crystal clear live video for superior monitoring.
- **Advanced 640px Scan:** AI scans frames at high resolution for maximum small-object detection.
- **Omni-Detection Logic:** Full-spectrum identification of **80 classes** (Persons, Vehicles, Appliances, Animals, etc.).
- **Dynamic Lighting (CLAHE):** Adaptive pre-processing ensures accuracy in shadows and low-light.
- **Smart Throttling:** Balanced performance keeping detection fast without CPU fatigue.

---

## 🎯 Professional Features

### 🔍 Elite AI Intelligence
- **Full Spectrum Visibility:** Monitors everything from persons to mobile phones, backpacks, and vehicles.
- **Selective Safety Floor:** Weapons (Knives/Scissors) are detected with a sensitive **25%** floor; others require **45%** for maximum accuracy.
- **Dynamic Labeling:** Automated, human-readable labels for all 80 object types.

### 📽️ Advanced Monitoring Controls
- **Theater Mode:** Double-click any camera to isolate it in a 1000px high-visibility "Focus View."
- **Frame-Freeze (Pause):** Temporarily halt any live stream to analyze a static moment.
- **Immersive Full Screen:** Native browser integration for max-view surveillance.
- **Dual-Camera Command:** Pre-configured for **Laptop Webcams** and 📱 **Iriun USB Webcams**.

### 🛡️ Forensic Hub
- **Real-time HUD:** High-contrast bounding boxes with capitalized labels.
- **Live Alert Feed:** Time-stamped, severity-aware notifications.
- **Persistent Event Log:** Full database search for historical detections.

---

## 🛠️ Deployment Instructions

### 1. Requirements
- Python 3.11+
- Node.js 18+
- Hardware Webcam (Laptop or Iriun)

### 2. Startup (Backend AI Node)
```bash
cd backend
python -m venv venv
# Activate venv, then:
pip install -r requirements.txt
python app.py
```
> Server initializes at **http://localhost:5000**

### 3. Startup (Frontend Dashboard)
```bash
cd frontend
npm install
npm run dev
```
> Dashboard launches at **http://localhost:3000**

---

## 🔐 System Access
- **Superuser Username:** `admin`
- **Default Password:** `admin123`

---

## 📄 Recognition
**SentinelVision Engineering Team — 2026**
Advanced Surveillance For Everyone.
