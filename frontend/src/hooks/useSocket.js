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
  const [liveBehaviors, setLiveBehaviors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('sentinel_token');
    
    // Absolute strategic fallback for Windows environments
    const backendUrl = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://127.0.0.1:5555'
      : window.location.origin;

    console.info(`[WS] Establishing Strategic Bridge on ${backendUrl}`);
    const socket = io(backendUrl, {
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[WS] Connected to mission core');
      setConnected(true);
      
      // Fetch initial anomalies to bootstrap the mission dashboard
      import('../services/api').then(({ getEvents }) => {
        getEvents({ limit: 15 }).then(data => {
          // Handle {events: [...], total: ...} response format
          const events = data?.events || [];
          if (Array.isArray(events)) {
            setAlerts(events);
          }
        }).catch(err => console.error('[WS] Initial bootstrap failure:', err));
      });
    });

    socket.on('disconnect', () => {
      console.log('[WS] Core connection lost');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[WS] Mission bridge connection error:', err.message);
    });

    socket.on('alert', (data) => {
      console.info('[INTEL] Active Threat Detected:', data.event_type);
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
        console.info('[INTEL] Scene Intelligence Briefing Received');
        setSceneBriefings((prev) => ({
          ...prev,
          [data.camera_id]: data,
        }));
      }
    });

    socket.on('live_behaviors', (data) => {
      if (data) {
        console.info('[INTEL] Live Behavioral Matrix Synchronized');
        setLiveBehaviors((prev) => ({
          ...prev,
          [data.camera_id]: data.behaviors,
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

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(a => (a.id || a.event_id) !== id));
  }, []);

  return {
    connected,
    alerts,
    setAlerts,
    frames,
    detectionUpdates,
    cameraStatuses,
    sceneBriefings,
    liveBehaviors,
    emitStartCamera,
    emitStopCamera,
    clearAlerts,
    removeAlert,
  };
}
