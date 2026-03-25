import { useState, useEffect } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import EventLog from './components/EventLog';
import AlertPanel from './components/AlertPanel';
import CameraGrid from './components/CameraGrid';
import useSocket from './hooks/useSocket';

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
    const savedUser = localStorage.getItem('safetysnap_user');
    const savedToken = localStorage.getItem('safetysnap_token');
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('safetysnap_user');
        localStorage.removeItem('safetysnap_token');
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('safetysnap_token');
    localStorage.removeItem('safetysnap_user');
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
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="card-header">
              <h3>System Settings</h3>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                  <label>MongoDB URI</label>
                  <input className="input" type="text" defaultValue="mongodb://localhost:27017/" />
                </div>
                <button className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>
                  Save Settings
                </button>
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
