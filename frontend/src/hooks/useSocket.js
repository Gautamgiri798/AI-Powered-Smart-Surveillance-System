/**
 * Custom hook for Socket.IO connection management.
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

export default function useSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [frames, setFrames] = useState({});
  const [detectionUpdates, setDetectionUpdates] = useState({});
  const [cameraStatuses, setCameraStatuses] = useState({});
  const [sceneBriefings, setSceneBriefings] = useState({});

  useEffect(() => {
    // Robust backend URL detection
    const hostname = window.location.hostname || 'localhost';
    const backendUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
      ? `${window.location.protocol}//${hostname}:5000`
      : window.location.origin;

    console.log(`[WS] Connecting to: ${backendUrl}`);
    
    // Synchronize token name with App.jsx security protocol
    const token = localStorage.getItem('sentinel_token');

    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WS] Connected to mission core');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Core connection lost');
      setConnected(false);
    });

    socket.on('alert', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 100));
    });

    socket.on('video_frame', (data) => {
      if (data && data.frame) {
        setFrames((prev) => ({
          ...prev,
          [data.camera_id]: data.frame,
        }));
      }
    });

    socket.on('detection_update', (data) => {
      if (data) {
        setDetectionUpdates((prev) => ({
          ...prev,
          [data.camera_id]: data,
        }));
      }
    });

    socket.on('camera_status', (data) => {
      if (data) {
        setCameraStatuses((prev) => ({
          ...prev,
          [data.camera_id]: data.status,
        }));
      }
    });

    socket.on('scene_briefing', (data) => {
      if (data) {
        setSceneBriefings((prev) => ({
          ...prev,
          [data.camera_id]: data,
        }));
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  const emitStartCamera = useCallback((cameraId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('start_camera', { camera_id: cameraId });
    }
  }, []);

  const emitStopCamera = useCallback((cameraId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit('stop_camera', { camera_id: cameraId });
    }
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    connected,
    alerts,
    frames,
    detectionUpdates,
    cameraStatuses,
    sceneBriefings,
    emitStartCamera,
    emitStopCamera,
    clearAlerts,
  };
}
