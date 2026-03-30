import { useState, useMemo, useEffect } from 'react';
import StatsCards from './StatsCards';
import CameraGrid from './CameraGrid';
import AlertPanel from './AlertPanel';
import SceneBriefing from './SceneBriefing';
import ActivityMonitor from './ActivityMonitor';
import { getEventStats } from '../services/api';

export default function Dashboard({
  alerts = [],
  frames = {},
  detectionUpdates = {},
  cameraStatuses = {},
  sceneBriefings = {},
  liveBehaviors = {},
  emitStartCamera,
  emitStopCamera,
  clearAlerts,
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
    // Highly defensive status counts
    const activeCount = Object.keys(cameraStatuses || {}).filter(
      (k) => cameraStatuses[k] === 'streaming'
    ).length;

    const totalPersons = Object.values(detectionUpdates || {}).reduce(
      (sum, d) => sum + (d?.persons || 0),
      0
    );

    return {
      activeCameras: activeCount || Object.keys(frames || {}).length,
      totalEvents: eventStats?.total_events || 0,
      criticalAlerts: eventStats?.by_severity?.critical || 0,
      personsDetected: totalPersons,
    };
  }, [cameraStatuses, frames, detectionUpdates, eventStats]);

  return (
    <div className={`dashboard-container ${focusedId ? 'theater-mode' : ''}`}>
      {!focusedId && <StatsCards stats={stats} />}

      <div className={`tactical-layout ${focusedId ? 'theater-layout' : ''}`}>
        <div className="video-section">
          <CameraGrid
            frames={frames || {}}
            detectionUpdates={detectionUpdates || {}}
            cameraStatuses={cameraStatuses || {}}
            emitStartCamera={emitStartCamera}
            emitStopCamera={emitStopCamera}
            focusedId={focusedId}
            setFocusedId={setFocusedId}
          />
        </div>
        
        <div className="intelligence-column">
          <ActivityMonitor 
            alerts={alerts || []} 
            liveBehaviors={liveBehaviors || {}} 
          />
          <SceneBriefing briefings={sceneBriefings || {}} />
          <AlertPanel alerts={alerts || []} onClear={clearAlerts} />
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
