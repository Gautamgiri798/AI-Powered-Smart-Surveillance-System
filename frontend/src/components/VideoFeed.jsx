import { useState, useRef, useEffect } from 'react';
import { Play, Square, Camera, Pause, Activity, Zap } from 'lucide-react';

export default function VideoFeed({
  camera,
  frame,
  isStreaming,
  onStart,
  onStop,
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [lastFrame, setLastFrame] = useState(null);

  useEffect(() => {
    if (!isStreaming) {
      setIsPaused(false);
      setLastFrame(null);
    }
  }, [isStreaming]);

  const togglePause = () => {
    if (!isPaused) setLastFrame(frame);
    setIsPaused(!isPaused);
  };

  const displayFrame = isPaused ? lastFrame : frame;

  return (
    <div className={`camera-card ${isStreaming ? 'streaming-active' : ''}`}>
      
      {/* High-Fidelity Tactical Header */}
      <div className="camera-header" style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <div className={`status-led ${isStreaming ? 'led-active' : 'led-inactive'}`} style={{ width: 8, height: 8 }}></div>
            <div className="cam-name" style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>
              {camera.name || 'UNNAMED_NODE'}
            </div>
          </div>
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', opacity: 0.8 }}>
            LOCATION // {camera.location?.toUpperCase() || 'UNKNOWN_COORD'}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <div style={{ 
            fontSize: '0.6rem', fontWeight: 900, 
            color: isStreaming ? 'var(--accent-green)' : 'var(--accent-red)', 
            letterSpacing: '0.15em', background: 'rgba(255,255,255,0.03)', 
            padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {isStreaming ? 'STREAMING' : 'OFFLINE'}
          </div>
          <div style={{ fontSize: '0.55rem', opacity: 0.4, fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            NODE_ID: {camera.camera_id}
          </div>
        </div>
      </div>

      {/* Forensic Monitoring View */}
      <div className="video-view-wrapper" style={{ height: '220px', background: '#020617', position: 'relative' }}>
        {displayFrame ? (
          <>
            <img 
              src={`data:image/jpeg;base64,${displayFrame}`} 
              alt="Feed" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            {/* OSD Overlay */}
            <div style={{ position: 'absolute', top: 20, left: 20 }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', background: 'rgba(0,0,0,0.7)', 
                padding: '6px 12px', borderRadius: 4, color: 'var(--accent-cyan)', fontWeight: 800,
                borderLeft: '3px solid var(--accent-cyan)', backdropFilter: 'blur(4px)'
              }}>
                NETWORK_LINK_ACTIVE // FEED_{camera.camera_id}
              </div>
            </div>
            
            {isStreaming && (
              <div style={{ position: 'absolute', bottom: 20, right: 20 }}>
                <Activity size={16} className="pulse" color="var(--accent-green)" />
              </div>
            )}
          </>
        ) : (
          <div className="forensic-placeholder" style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', 
            justifyContent: 'center', width: '100%', height: '100%',
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, transparent 100%)'
          }}>

            
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
                border: '1px solid rgba(255,255,255,0.05)', boxSizing: 'border-box'
              }}>
                <Camera size={28} color="rgba(255,255,255,0.1)" strokeWidth={1.5} />
              </div>
              <div style={{ 
                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.4em', 
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)',
                fontFamily: 'var(--font-heading)'
              }}>
                Standby Protocol
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mission Control Panel */}
      <div className="camera-footer" style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.01)' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {!isStreaming ? (
            <button
              className="btn-engage-elite"
              onClick={() => onStart(camera.camera_id)}
            >
              <Zap size={14} fill="currentColor" />
              START FEEDS
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="mission-action-btn btn-ack-elite"
                onClick={togglePause}
                style={{ padding: '10px 18px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              >
                {isPaused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
                {isPaused ? 'RESUME' : 'PAUSE'}
              </button>
              <button
                className="mission-action-btn btn-purge-elite"
                onClick={() => onStop(camera.camera_id)}
                style={{ width: 44, height: 44, padding: 0, background: 'rgba(244, 63, 94, 0.1)', color: 'var(--accent-red)', border: '1px solid rgba(244, 63, 94, 0.2)' }}
              >
                <Square size={14} fill="currentColor" />
              </button>
            </div>
          )}
        </div>
        
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 800, letterSpacing: '0.05em' }}>
            {camera.rtsp_url === '0' ? 'INTERNAL_CORE_LINK' : 'EXTERNAL_USB_LINK'}
          </div>
          <div style={{ width: 50, height: 2, background: 'rgba(255,255,255,0.05)', marginLeft: 'auto', borderRadius: 4 }}>
            {isStreaming && <div className="pulse" style={{ width: '100%', height: '100%', background: 'var(--accent-green)', opacity: 0.3 }}></div>}
          </div>
        </div>
      </div>
    </div>

  );
}
