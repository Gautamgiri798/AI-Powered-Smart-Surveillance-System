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

  useEffect(() => {
    // Robust backend URL detection
    const hostname = window.location.hostname || 'localhost';
    const backendUrl = (hostname === 'localhost' || hostname === '127.0.0.1')
      ? `${window.location.protocol}//${hostname}:5000`
      : window.location.origin;

    console.log(`[WS] Connecting to: ${backendUrl}`);
    const socket = io(backendUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      auth: { token: localStorage.getItem('safetysnap_token') }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WS] Connected');
      setConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Disconnected');
      setConnected(false);
    });

    socket.on('alert', (data) => {
      setAlerts((prev) => [data, ...prev].slice(0, 100));
    });

    socket.on('video_frame', (data) => {
      setFrames((prev) => ({
        ...prev,
        [data.camera_id]: data.frame,
      }));
    });

    socket.on('detection_update', (data) => {
      setDetectionUpdates((prev) => ({
        ...prev,
        [data.camera_id]: data,
      }));
    });

    socket.on('camera_status', (data) => {
      setCameraStatuses((prev) => ({
        ...prev,
        [data.camera_id]: data.status,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const emitStartCamera = useCallback((cameraId) => {
    if (socketRef.current) {
      socketRef.current.emit('start_camera', { camera_id: cameraId });
    }
  }, []);

  const emitStopCamera = useCallback((cameraId) => {
    if (socketRef.current) {
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
    emitStartCamera,
    emitStopCamera,
    clearAlerts,
  };
}
