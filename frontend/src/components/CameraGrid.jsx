import { useEffect, useState } from 'react';
import VideoFeed from './VideoFeed';
import { getCameras, startCamera, stopCamera } from '../services/api';
import { ChevronLeft, Grid } from 'lucide-react';

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
      <div className="camera-card" style={{ padding: 40, textAlign: 'center', opacity: 0.5 }}>
        <p style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>LOADING MISSION NODES...</p>
      </div>
    );
  }

  const focusedCamera = cameras.find(c => c.camera_id === focusedId);

  return (
    <div className="video-section">
      {focusedId && focusedCamera ? (
        <div className="focused-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="focused-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <Grid size={18} />
              FOCUSED MISSION CONTROL: {focusedCamera.name}
            </h3>
            <button 
              className="engage-btn" 
              style={{ background: 'rgba(255,255,255,0.02) !important', color: 'var(--text-secondary) !important', border: '1px solid var(--border-light)', padding: '10px 18px', fontSize: '0.75rem' }} 
              onClick={() => setFocusedId(null)}
            >
              <ChevronLeft size={16} />
              BACK TO WALL
            </button>
          </div>
          <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
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
                title="Double-click for Focused Mission Control"
                style={{ cursor: 'pointer' }}
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
        <div className="camera-card" style={{ padding: 48, textAlign: 'center', opacity: 0.6 }}>
          <Grid size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, margin: '0 auto', opacity: 0.3 }} />
          <p style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>NO MISSION NODES CONFIGURED</p>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8 }}>Integrate situational sources in System Protocols</div>
        </div>
      )}
    </div>
  );
}
