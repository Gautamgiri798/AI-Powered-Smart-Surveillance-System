import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EventLog from './components/EventLog';
import AlertPanel from './components/AlertPanel';
import CameraGrid from './components/CameraGrid';
import CameraManager from './components/CameraManager';
import VideoLab from './components/VideoLab';
import useSocket from './hooks/useSocket';
import { Settings, Save, Shield, Cpu, Activity, Database, Clock } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard',
  cameras: 'Cameras',
  analysis: 'Analysis',
  alerts: 'Alerts',
  events: 'Events',
  settings: 'Settings',
};

export default function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const {
    connected,
    alerts,
    frames,
    detectionUpdates,
    cameraStatuses,
    sceneBriefings,
    emitStartCamera,
    emitStopCamera,
    clearAlerts,
  } = useSocket();

  // Check for existing session
  useEffect(() => {
    const savedUser = localStorage.getItem('sentinel_user');
    const savedToken = localStorage.getItem('sentinel_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sentinel_user');
        localStorage.removeItem('sentinel_token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('sentinel_token');
    localStorage.removeItem('sentinel_user');
    setUser(null);
  };

  // Show login if not authenticated
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <Dashboard
            alerts={alerts}
            frames={frames}
            detectionUpdates={detectionUpdates}
            cameraStatuses={cameraStatuses}
            sceneBriefings={sceneBriefings}
            emitStartCamera={emitStartCamera}
            emitStopCamera={emitStopCamera}
            clearAlerts={clearAlerts}
          />
        );
      case 'cameras':
        return (
          <CameraGrid
            frames={frames}
            detectionUpdates={detectionUpdates}
            cameraStatuses={cameraStatuses}
            emitStartCamera={emitStartCamera}
            emitStopCamera={emitStopCamera}
          />
        );
      case 'analysis':
        return <VideoLab />;
      case 'alerts':
        return (
          <div style={{ maxWidth: 500, height: '100%' }}>
            <AlertPanel alerts={alerts} onClear={clearAlerts} />
          </div>
        );
      case 'events':
        return <EventLog />;
      case 'settings':
        return (
          <div className="dashboard-container" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="camera-card" style={{ padding: 40, background: 'var(--bg-card)', marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <Settings size={28} color="var(--accent-primary)" />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Core Settings</h2>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 40 }}>Calibrate the AI protocols and mission infrastructure parameters.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Shield size={12} /> Detection Confidence
                  </label>
                  <input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 12, color: '#fff', fontSize: '0.9rem' }} type="number" defaultValue="0.45" step="0.05" />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={12} /> Loitering Threshold (sec)
                  </label>
                  <input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 12, color: '#fff', fontSize: '0.9rem' }} type="number" defaultValue="30" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Cpu size={12} /> FPS Processing Limit
                  </label>
                  <input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 12, color: '#fff', fontSize: '0.9rem' }} type="number" defaultValue="15" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Activity size={12} /> Event Log Persistence (days)
                  </label>
                  <input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 12, color: '#fff', fontSize: '0.9rem' }} type="number" defaultValue="7" />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, gridColumn: 'span 2' }}>
                  <label style={{ fontSiz: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Database size={12} /> MongoDB Intelligence URI
                  </label>
                  <input style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '12px 16px', borderRadius: 12, color: '#fff', fontSize: '0.9rem', width: '100%' }} type="text" defaultValue="mongodb://localhost:27017/" />
                </div>

                <div style={{ gridColumn: 'span 2', marginTop: 12 }}>
                  <button className="engage-btn" style={{ background: 'var(--accent-primary) !important', width: '100%', justifyContent: 'center', height: 50, fontSize: '0.9rem' }}>
                    <Save size={16} /> COMMIT CORE PROTOCOLS
                  </button>
                </div>
              </div>
            </div>

            <div className="camera-card" style={{ padding: 0, background: 'var(--bg-card)' }}>
              <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Activity size={18} color="var(--accent-cyan)" /> NODE REGISTRY
                </h3>
              </div>
              <CameraManager />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        onLogout={handleLogout}
      />
      <div className="main-content">
        <Header
          title={PAGE_TITLES[activePage] || 'Dashboard'}
          connected={connected}
          alertCount={alerts.length}
        />
        <div className="page-content">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
