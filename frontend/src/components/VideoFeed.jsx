import { useState, useRef, useEffect } from 'react';
import { Play, Square, Camera, Pause, Activity, Zap, Maximize, Shield } from 'lucide-react';

export default function VideoFeed({
  camera,
  frame,
  isStreaming,
  onStart,
  onStop,
  showFullscreen = false,
}) {
  const [isPaused, setIsPaused] = useState(false);
  const [lastFrame, setLastFrame] = useState(null);
  const containerRef = useRef(null);

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

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const displayFrame = isPaused ? lastFrame : frame;

  return (
    <div 
      className={`camera-card ${isStreaming ? 'streaming-active' : ''}`}
      ref={containerRef}
      style={{ 
        overflow: 'hidden', position: 'relative', 
        height: showFullscreen ? '100%' : 'auto',
        display: 'flex', flexDirection: 'column'
      }}
    >
      
      {/* High-Fidelity Tactical Header */}
      <div className="camera-header" style={{ padding: '20px 10px 20px 24px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
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
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, paddingRight: 80 }}>
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

      {/* Absolute Fullscreen Toggle */}
      {showFullscreen && (
        <button 
          className="mission-action-btn fullscreen-btn-tactical"
          onClick={toggleFullscreen}
          style={{ 
            position: 'absolute', top: 22, right: 24, zIndex: 100,
            background: 'rgba(99, 102, 241, 0.15)', 
            border: '1px solid rgba(99, 102, 241, 0.4)', 
            color: 'var(--accent-primary)',
            width: 42, height: 42, padding: 0,
            borderRadius: 12, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.2)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          title="Surgical Fullscreen Toggle"
        >
          <Maximize size={18} strokeWidth={3} />
        </button>
      )}

      {/* Forensic Monitoring View */}
      <div className="video-view-wrapper" style={{ minHeight: showFullscreen ? '100%' : '340px', background: '#020617', position: 'relative', flex: 1, overflow: 'hidden' }}>
        {displayFrame ? (
          <>
            <img 
              src={`data:image/jpeg;base64,${displayFrame}`} 
              alt="Feed" 
              style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} 
            />
            
            {/* Tactical Scanline & Vignette */}
            <div className="tactical-overlay" style={{ 
              position: 'absolute', inset: 0, 
              background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.2) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.05), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.05))',
              backgroundSize: '100% 4px, 3px 100%',
              pointerEvents: 'none',
              opacity: 0.3, zIndex: 5
            }}></div>
            <div style={{ 
              position: 'absolute', inset: 0, 
              boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)', 
              pointerEvents: 'none', zIndex: 6 
            }}></div>

            {/* OSD Overlay */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
              <div style={{ 
                fontFamily: 'var(--font-mono)', fontSize: '0.6rem', background: 'rgba(5, 8, 16, 0.8)', 
                padding: '6px 12px', borderRadius: 4, color: 'var(--accent-cyan)', fontWeight: 800,
                borderLeft: '3px solid var(--accent-cyan)', backdropFilter: 'blur(8px)',
                boxShadow: '0 0 20px rgba(34, 211, 238, 0.2)', display: 'flex', alignItems: 'center'
              }}>
                <Shield size={10} style={{ marginRight: 8 }} />
                NETWORK_LINK_ACTIVE // FEED_{camera.camera_id}
              </div>
            </div>
            
            {isStreaming && (
              <div style={{ position: 'absolute', bottom: 20, right: 20, zIndex: 10 }}>
                <Activity size={16} className="pulse" color="var(--accent-green)" />
              </div>
            )}
          </>
        ) : (
          <div className="forensic-placeholder" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            width: '100%', 
            height: '100%',
            background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.45) 0%, transparent 100%)',
            position: 'absolute',
            inset: 0
          }}>
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div style={{ 
                width: 80, height: 80, borderRadius: '24px', background: 'rgba(59, 130, 246, 0.05)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(59, 130, 246, 0.15)', boxShadow: '0 0 30px rgba(59, 130, 246, 0.05)'
              }}>
                <Camera size={32} color="rgba(59, 130, 246, 0.3)" strokeWidth={1.5} />
              </div>
              <div style={{ 
                fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.4em', 
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)',
                fontFamily: 'var(--font-heading)', textAlign: 'center'
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
      <style>{`
        :fullscreen { 
          background: #020617 !important; 
          width: 100vw !important; 
          height: 100vh !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 20px !important;
          box-sizing: border-box !important;
        }
        :fullscreen .video-view-wrapper {
          height: auto !important;
        }
        .fullscreen-btn-tactical:hover {
          background: rgba(99, 102, 241, 0.2) !important;
          border-color: var(--accent-primary) !important;
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>

  );
}
