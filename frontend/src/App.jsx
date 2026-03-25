import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EventLog from './components/EventLog';
import AlertPanel from './components/AlertPanel';
import CameraGrid from './components/CameraGrid';
import CameraManager from './components/CameraManager';
import useSocket from './hooks/useSocket';
import { Settings, Save } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Surveillance Dashboard',
  cameras: 'Camera Management',
  alerts: 'Alert Center',
  events: 'Event Log',
  settings: 'System Settings',
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 900 }}>
            <div className="card">
              <div className="card-header">
                <h3><Settings size={18} /> System Configurations</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label>Detection Confidence Threshold</label>
                    <input className="input" type="number" defaultValue="0.45" step="0.05" min="0.1" max="1.0" />
                  </div>
                  <div className="form-group">
                    <label>Loitering Threshold (seconds)</label>
                    <input className="input" type="number" defaultValue="30" />
                  </div>
                  <div className="form-group">
                    <label>FPS Limit</label>
                    <input className="input" type="number" defaultValue="15" />
                  </div>
                  <div className="form-group">
                    <label>Alert Retention (days)</label>
                    <input className="input" type="number" defaultValue="7" />
                  </div>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label>MongoDB Notification URI</label>
                    <input className="input" type="text" defaultValue="mongodb://localhost:27017/" />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <button className="btn btn-primary btn-sm">
                      <Save size={14} /> Save System Settings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <CameraManager />
              </div>
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
