import { useState, useRef, useEffect } from 'react';
import { Play, Square, Camera, Video, Maximize, Pause, RotateCcw } from 'lucide-react';
import { updateCamera } from '../services/api';

export default function VideoFeed({
  camera,
  frame,
  detectionData,
  isStreaming,
  onStart,
  onStop,
}) {
  const containerRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [lastFrame, setLastFrame] = useState(null);
  const hasThreat = detectionData?.has_threat;
  const [sourceIndex, setSourceIndex] = useState(camera.rtsp_url || '0');

  // Reset pause state when stream stops
  useEffect(() => {
    if (!isStreaming) {
      setIsPaused(false);
      setLastFrame(null);
    }
  }, [isStreaming]);

  const togglePause = () => {
    if (!isPaused) {
      setLastFrame(frame);
    }
    setIsPaused(!isPaused);
  };

  const handleFullScreen = () => {
    if (containerRef.current) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    }
  };

  const displayFrame = isPaused ? lastFrame : frame;

  return (
    <div className={`video-card ${hasThreat ? 'threat-active' : ''}`}>
      <div className="video-header">
        <div className="video-header-left">
          {isStreaming && (
            <div className={`recording-dot ${isPaused ? 'paused' : ''}`} />
          )}
          <div>
            <div className="cam-name">{camera.name}</div>
            <div className="cam-location">{camera.location}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isStreaming && (
            <button 
              className="btn-icon" 
              onClick={handleFullScreen}
              title="Full Screen"
              style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Maximize size={18} />
            </button>
          )}
          <span className={`badge ${camera.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
            {camera.status}
          </span>
        </div>
      </div>

      <div className="video-container" ref={containerRef}>
        {displayFrame ? (
          <>
            <img
              src={`data:image/jpeg;base64,${displayFrame}`}
              alt={`Feed from ${camera.name}`}
            />
            {!isPaused && <div className="scan-line" />}
            {isPaused && (
              <div className="paused-overlay">
                <Pause size={48} />
                <span>PAUSED</span>
              </div>
            )}
            <div className="video-overlay">
              <span className="fps">
                FPS: {isPaused ? '0' : (detectionData?.fps ?? '--')}
              </span>
              <span className="detection-count">
                👤 {detectionData?.persons ?? 0} | 🔪 {detectionData?.weapons ?? 0}
              </span>
            </div>
          </>
        ) : (
          <div className="video-placeholder">
            <div className="placeholder-icon">
              <Camera size={48} />
              {isStreaming && <div className="loader-mini" />}
            </div>
            <p>{isStreaming ? 'Connecting to Stream...' : 'Camera Offline'}</p>
            <div className="placeholder-details">
              <span>ID: {camera.camera_id}</span>
              <span>TYPE: {camera.type?.toUpperCase()}</span>
            </div>
          </div>
        )}
      </div>

      <div className="video-actions">
        <div style={{ display: 'flex', gap: 8 }}>
          {!isStreaming ? (
            <button
              id={`start-${camera.camera_id}`}
              className="btn btn-success btn-sm"
              onClick={() => onStart(camera.camera_id)}
            >
              <Play size={14} />
              Start Engine
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className={`btn btn-sm ${isPaused ? 'btn-success' : 'btn-warning'}`}
                onClick={togglePause}
                style={{ color: isPaused ? 'white' : 'inherit' }}
              >
                {isPaused ? <Play size={14} /> : <Pause size={14} />}
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                id={`stop-${camera.camera_id}`}
                className="btn btn-danger btn-sm"
                onClick={() => onStop(camera.camera_id)}
              >
                <Square size={14} />
                Stop
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Video size={13} />
          {camera.rtsp_url === '1' ? 'Laptop System' : 'Iriun USB'}
        </div>
      </div>
    </div>
  );
}
