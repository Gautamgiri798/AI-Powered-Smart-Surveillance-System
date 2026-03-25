import { useEffect, useState } from 'react';
import VideoFeed from './VideoFeed';
import { getCameras, startCamera, stopCamera } from '../services/api';

export default function CameraGrid({ frames, detectionUpdates, cameraStatuses, emitStartCamera, emitStopCamera }) {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const data = await getCameras();
      setCameras(data.cameras || []);
    } catch (err) {
      console.error('Failed to load cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (cameraId) => {
    try {
      await startCamera(cameraId);
      emitStartCamera(cameraId);
      loadCameras();
    } catch (err) {
      console.error('Failed to start camera:', err);
      // Fallback: try via WebSocket
      emitStartCamera(cameraId);
    }
  };

  const handleStop = async (cameraId) => {
    try {
      await stopCamera(cameraId);
      emitStopCamera(cameraId);
      loadCameras();
    } catch (err) {
      console.error('Failed to stop camera:', err);
      emitStopCamera(cameraId);
    }
  };

  if (loading) {
    return (
      <div className="video-section">
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading cameras...
        </div>
      </div>
    );
  }

  return (
    <div className="video-section">
      <div className="camera-grid">
        {cameras.map((camera) => {
          const isStreaming =
            camera.is_streaming ||
            cameraStatuses[camera.camera_id] === 'streaming';

          return (
            <VideoFeed
              key={camera.camera_id}
              camera={camera}
              frame={frames[camera.camera_id]}
              detectionData={detectionUpdates[camera.camera_id]}
              isStreaming={isStreaming}
              onStart={handleStart}
              onStop={handleStop}
            />
          );
        })}

        {cameras.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No cameras configured. Add cameras in Settings.
          </div>
        )}
      </div>
    </div>
  );
}
