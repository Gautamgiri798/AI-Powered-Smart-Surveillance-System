# 🛡️ SafetySnap — AI-Powered Smart Surveillance System

> Real-time AI surveillance with weapon detection, behavior analysis, and instant alerts.

---

## 🏗️ Architecture

```
[Camera/RTSP Streams]
        ↓
[Edge Processing (OpenCV + YOLOv8)]
        ↓ (Frames / Events)
[Backend Server (Flask + SocketIO)]
        ↓
 ┌───────────────┬────────────────┬────────────────┐
 │ CV Service    │ Alert Service  │ Storage Layer  │
 │ (YOLO, NLP)  │ (Rules Engine) │ (MongoDB)      │
 └───────────────┴────────────────┴────────────────┘
        ↓
[WebSocket API]
        ↓
[React Frontend Dashboard]
```

## ⚡ Tech Stack

| Layer | Technology | Communication |
|-------|-----------|---------------|
| Frontend | React + Vite | WebSocket + REST |
| Backend API | Flask | REST |
| Real-time | Flask-SocketIO | WebSocket |
| CV Engine | OpenCV + YOLOv8 | Internal API |
| Database | SQLite3 | Built-in Python |
| Deployment | Docker Compose | Internal networking |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```
> Server starts at http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
> Dashboard opens at http://localhost:3000

### Docker (All-in-One)
```bash
docker-compose up --build
```

## 🔑 Default Login
- **Username:** `admin`
- **Password:** `admin123`

## 🎯 Features

### Core
- ✅ Live camera feed streaming (USB/RTSP)
- ✅ Real-time person & weapon detection (YOLOv8)
- ✅ Alert generation with severity levels
- ✅ Real-time dashboard with WebSocket updates
- ✅ Event logging with MongoDB
- ✅ JWT Authentication

### Detection Pipeline
- ✅ YOLOv8 object detection
- ✅ Centroid-based multi-object tracking
- ✅ Weapon detection (knife, scissors)
- ✅ Behavior analysis (loitering, running, crowd)
- ✅ Alert throttling (prevents spam)

### Dashboard
- ✅ Live video feeds with scan-line overlay
- ✅ Real-time alert panel with severity badges
- ✅ Stats cards (cameras, events, threats)
- ✅ Event log with filtering & acknowledgment
- ✅ Camera start/stop controls
- ✅ Dark theme with glassmorphism design

## 📁 Project Structure
```
├── backend/
│   ├── app.py                  # Flask + SocketIO server
│   ├── config.py               # Configuration
│   ├── models/db.py            # SQLite3 database layer
│   ├── services/
│   │   ├── detection_service.py  # YOLO detection
│   │   ├── tracking_service.py   # Object tracking
│   │   ├── behavior_service.py   # Behavior analysis
│   │   ├── alert_service.py      # Alert rules engine
│   │   └── video_service.py      # Video streaming
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── camera_routes.py
│   │   ├── event_routes.py
│   │   └── stream_routes.py
│   └── utils/
│       ├── auth_utils.py
│       └── frame_utils.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── components/
│       │   ├── Dashboard.jsx
│       │   ├── VideoFeed.jsx
│       │   ├── AlertPanel.jsx
│       │   ├── CameraGrid.jsx
│       │   ├── EventLog.jsx
│       │   ├── StatsCards.jsx
│       │   ├── Sidebar.jsx
│       │   ├── Header.jsx
│       │   └── Login.jsx
│       ├── hooks/useSocket.js
│       └── services/api.js
├── docker-compose.yml
└── README.md
```

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register (admin) |
| GET | `/api/auth/me` | Current user |

### Cameras
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cameras` | List cameras |
| POST | `/api/cameras` | Add camera |
| POST | `/api/cameras/:id/start` | Start streaming |
| POST | `/api/cameras/:id/stop` | Stop streaming |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List events |
| GET | `/api/events/stats` | Event statistics |
| POST | `/api/events/:id/acknowledge` | Acknowledge event |

### WebSocket Events
| Event | Direction | Data |
|-------|-----------|------|
| `video_frame` | Server → Client | `{ camera_id, frame, timestamp }` |
| `alert` | Server → Client | `{ type, severity, description }` |
| `detection_update` | Server → Client | `{ camera_id, persons, weapons }` |
| `start_camera` | Client → Server | `{ camera_id }` |
| `stop_camera` | Client → Server | `{ camera_id }` |

## 🧠 Detection Classes
- **Person** (COCO class 0)
- **Knife** (COCO class 43)
- **Scissors** (COCO class 76)

## 🚨 Alert Severity Levels
| Level | Color | Examples |
|-------|-------|----------|
| Critical | 🔴 Red | Weapon + Person |
| High | 🟠 Orange | Weapon detected |
| Medium | 🟡 Yellow | Running person, Crowd |
| Low | 🟢 Green | Loitering |

## 📄 License
MIT
