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
    // 1. Calculate truly active cameras by merging real-time socket status with DB initial state
    const activeIds = new Set();
    
    // Check initial DB state
    cameras.forEach(cam => {
      if (cam.is_streaming) activeIds.add(cam.camera_id);
    });

    // Layer in real-time overrides from Socket.IO
    Object.entries(cameraStatuses || {}).forEach(([id, status]) => {
      if (status === 'streaming') activeIds.add(id);
      else activeIds.delete(id);
    });
    
    const displayActiveCount = activeIds.size;

    // 2. Unify real-time alert count with historical stats
    // We treat eventStats (DB) as the source of truth for history, and alerts (live) as current session additions
    // However, since eventStats refreshes every 10s, we just ensure we show the most up-to-date total.
    const displayTotalEvents = Math.max(alerts.length, eventStats?.total_events || 0);
    
    const liveCriticalCount = alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length;
    const displayCriticalAlerts = Math.max(liveCriticalCount, eventStats?.by_severity?.critical || 0);

    // 3. Current occupancy (People Count) across all active frames
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
  }, [cameraStatuses, alerts, detectionUpdates, eventStats, cameras]);

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
