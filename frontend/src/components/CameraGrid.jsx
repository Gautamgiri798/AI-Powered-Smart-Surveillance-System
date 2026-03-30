import { useEffect, useState } from 'react';
import VideoFeed from './VideoFeed';
import { getCameras, startCamera, stopCamera } from '../services/api';
import { ChevronLeft, Grid } from 'lucide-react';

export default function CameraGrid({ 
  frames, 
  detectionUpdates, 
  cameraStatuses, 
  emitStartCamera, 
  emitStopCamera,
  focusedId,
  setFocusedId 
}) {
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCameras(); }, []);

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
      emitStartCamera(cameraId);
    }
  };

  const handleStop = async (cameraId) => {
    try {
      await stopCamera(cameraId);
      emitStopCamera(cameraId);
      loadCameras();
    } catch (err) {
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
        <div className="focused-view animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="focused-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: 16, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              <Grid size={22} color="var(--accent-primary)" />
              <span style={{ opacity: 0.5, fontWeight: 500 }}>FOCUSED_COMMAND //</span> {focusedCamera.name}
            </h3>
            <button 
              className="back-wall-btn-tactical" 
              onClick={() => setFocusedId(null)}
              style={{ 
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                color: 'var(--accent-primary)',
                padding: '12px 24px',
                fontSize: '0.7rem',
                fontWeight: 900,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 20px rgba(99, 102, 241, 0.1)'
              }}
            >
              <ChevronLeft size={18} strokeWidth={3} />
              <span>EXIT_FOCUS</span>
            </button>
          </div>
          
          <div className="focused-theater-container" style={{ 
            width: '100%', 
            position: 'relative',
            borderRadius: 24,
            padding: 4,
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, transparent 100%)',
            boxShadow: '0 0 80px rgba(0,0,0,0.5), inset 0 0 40px rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(255,255,255,0.03)',
            overflow: 'hidden'
          }}>
            <div style={{ height: '480px', width: '100%', display: 'flex', flexDirection: 'column' }}>
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
                showFullscreen={true}
              />
            </div>
            {/* Ambient Background Scanlines */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'repeating-linear-gradient(transparent, transparent 2px, rgba(99, 102, 241, 0.01) 3px)', opacity: 0.5, zIndex: -1 }}></div>
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
                  showFullscreen={false}
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
