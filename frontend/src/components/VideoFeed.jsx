import { useState } from 'react';
import { Play, Square, Camera, Video } from 'lucide-react';
import { updateCamera } from '../services/api';

export default function VideoFeed({
  camera,
  frame,
  detectionData,
  isStreaming,
  onStart,
  onStop,
}) {
  const hasThreat = detectionData?.has_threat;
  const [sourceIndex, setSourceIndex] = useState(camera.rtsp_url || '0');

  const handleSourceChange = async (e) => {
    const val = e.target.value;
    setSourceIndex(val);
    try {
      await updateCamera(camera.camera_id, { rtsp_url: val });
    } catch (err) {
      console.error('Failed to change camera source:', err);
    }
  };

  return (
    <div className={`video-card ${hasThreat ? 'threat-active' : ''}`}>
      <div className="video-header">
        <div className="video-header-left">
          {isStreaming && <div className="recording-dot" />}
          <div>
            <div className="cam-name">{camera.name}</div>
            <div className="cam-location">{camera.location}</div>
          </div>
        </div>
        <span className={`badge ${camera.status === 'active' ? 'badge-active' : 'badge-inactive'}`}>
          {camera.status}
        </span>
      </div>

      <div className="video-container">
        {frame ? (
          <>
            <img
              src={`data:image/jpeg;base64,${frame}`}
              alt={`Feed from ${camera.name}`}
            />
            <div className="scan-line" />
            <div className="video-overlay">
              <span className="fps">
                FPS: {detectionData?.fps ?? '--'}
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
            {camera.rtsp_url && camera.rtsp_url !== '0' && (
               <span className="placeholder-url">{camera.rtsp_url}</span>
            )}
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
              Start
            </button>
          ) : (
            <button
              id={`stop-${camera.camera_id}`}
              className="btn btn-danger btn-sm"
              onClick={() => onStop(camera.camera_id)}
            >
              <Square size={14} />
              Stop
            </button>
          )}

          {camera.camera_id === 'cam_1' && !isStreaming && (
            <select 
              value={sourceIndex} 
              onChange={handleSourceChange}
              className="input" 
              style={{ padding: '6px 12px', fontSize: '0.75rem', height: 'auto', width: 'auto', marginLeft: '6px' }}
            >
              <option value="0">📱 Iriun Webcam (0)</option>
              <option value="1">💻 PC System Camera (1)</option>
              <option value="2">📱 Virtual Camera (2)</option>
            </select>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Video size={13} />
          {camera.type?.toUpperCase() || 'USB'}
        </div>
      </div>
    </div>
  );
}
