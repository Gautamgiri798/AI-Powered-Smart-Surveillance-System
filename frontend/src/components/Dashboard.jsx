import { useState, useMemo, useEffect } from 'react';
import StatsCards from './StatsCards';
import CameraGrid from './CameraGrid';
import AlertPanel from './AlertPanel';
import { getEventStats } from '../services/api';
import { Monitor } from 'lucide-react';

export default function Dashboard({
  cameras = [],
  alerts = [],
  frames = {},
  detectionUpdates = {},
  cameraStatuses = {},
  sceneBriefings = {},
  liveBehaviors = {},
  emitStartCamera,
  emitStopCamera,
  clearAlerts,
  removeAlert,
  onRefresh,
  isSyncing,
}) {
  const [eventStats, setEventStats] = useState(null);
  const [focusedId, setFocusedId] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getEventStats();
        setEventStats(stats);
      } catch (err) {
        console.error('Failed to fetch event stats:', err);
      }
    };
    fetchStats();
    const timer = setInterval(fetchStats, 10000);
    return () => clearInterval(timer);
  }, []);

  const stats = useMemo(() => {
    const activeCount = Object.keys(cameraStatuses || {}).filter(
      (k) => cameraStatuses[k] === 'streaming'
    ).length;
    
    // Fallback to absolute camera registry if socket hasn't reported yet
    const displayActiveCount = activeCount > 0 ? activeCount : (cameras?.length || 0);

    // Unify real-time alert count with historical stats
    const liveCriticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const displayTotalEvents = Math.max(alerts.length, eventStats?.total_events || 0);
    const displayCriticalAlerts = Math.max(liveCriticalCount, eventStats?.by_severity?.critical || 0);

    const totalPersons = Object.values(detectionUpdates || {}).reduce(
      (sum, d) => sum + (d?.persons || 0),
      0
    );

    return {
      activeCameras: displayActiveCount,
      totalEvents: displayTotalEvents,
      criticalAlerts: displayCriticalAlerts,
      personsDetected: totalPersons,
    };
  }, [cameraStatuses, frames, detectionUpdates, eventStats]);

  return (
    <div className={`dashboard-container ${focusedId ? 'theater-mode' : ''}`}>
      {!focusedId && <StatsCards stats={stats} />}

      <div className={`tactical-layout ${focusedId ? 'theater-layout' : ''}`}>
        <div className="video-section">
          <CameraGrid
            cameras={cameras}
            frames={frames || {}}
            detectionUpdates={detectionUpdates || {}}
            cameraStatuses={cameraStatuses || {}}
            emitStartCamera={emitStartCamera}
            emitStopCamera={emitStopCamera}
            focusedId={focusedId}
            setFocusedId={setFocusedId}
          />
          {cameras.length === 0 && (
            <div className="camera-card" style={{ padding: 48, textAlign: 'center', opacity: 0.6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Monitor size={48} style={{ color: 'var(--text-muted)', marginBottom: 16, opacity: 0.3 }} />
              <p style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-muted)' }}>NO MISSION NODES CONFIGURED</p>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 8, marginBottom: 24 }}>System protocols pending node acquisition</div>
              
              <button 
                className="mission-action-btn btn-engage-primary" 
                onClick={onRefresh}
                disabled={isSyncing}
                style={{ width: 'auto', padding: '12px 30px' }}
              >
                {isSyncing ? 'SYNCHRONIZING...' : 'FORCE SITUATIONAL RECOVERY'}
              </button>
            </div>
          )}
        </div>
        
        <div className="intelligence-column">
          <AlertPanel 
            alerts={alerts || []} 
            liveBehaviors={liveBehaviors || {}}
            onClear={clearAlerts} 
            onRemove={removeAlert}
          />
        </div>
      </div>
      <style>{`
        .theater-mode {
          padding-top: 10px !important;
        }
        .theater-layout {
          grid-template-columns: 1fr 350px !important;
          gap: 30px !important;
        }
        .theater-mode .video-section {
          animation: slideUp 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
