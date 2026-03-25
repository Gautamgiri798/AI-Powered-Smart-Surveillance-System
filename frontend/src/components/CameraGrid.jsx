import { useEffect, useState } from 'react';
import VideoFeed from './VideoFeed';
import { getCameras, startCamera, stopCamera } from '../services/api';

export default function CameraGrid({ frames, detectionUpdates, cameraStatuses, emitStartCamera, emitStopCamera }) {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedId, setFocusedId] = useState(null);

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

  const focusedCamera = cameras.find(c => c.camera_id === focusedId);

  return (
    <div className="video-section">
      {focusedId && focusedCamera ? (
        <div className="focused-view">
          <div className="focused-header">
            <h3>Focused View: {focusedCamera.name}</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setFocusedId(null)}>
              Back to Grid
            </button>
          </div>
          <VideoFeed
            camera={focusedCamera}
            frame={frames[focusedCamera.camera_id]}
            detectionData={detectionUpdates[focusedCamera.camera_id]}
            isStreaming={
              focusedCamera.is_streaming ||
              cameraStatuses[focusedCamera.camera_id] === 'streaming'
            }
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>
      ) : (
        <div className="camera-grid">
          {cameras.map((camera) => {
            const isStreaming =
              camera.is_streaming ||
              cameraStatuses[camera.camera_id] === 'streaming';

            return (
              <div 
                key={camera.camera_id} 
                className="grid-item-wrapper"
                onDoubleClick={() => setFocusedId(camera.camera_id)}
                title="Double-click to focus"
              >
                <VideoFeed
                  camera={camera}
                  frame={frames[camera.camera_id]}
                  detectionData={detectionUpdates[camera.camera_id]}
                  isStreaming={isStreaming}
                  onStart={handleStart}
                  onStop={handleStop}
                />
              </div>
            );
          })}
        </div>
      )}

      {cameras.length === 0 && (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
          No cameras configured. Add cameras in Settings.
        </div>
      )}
    </div>
  );
}
