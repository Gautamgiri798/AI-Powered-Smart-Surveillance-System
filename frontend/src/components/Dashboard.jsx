import { useState, useMemo, useEffect } from 'react';
import StatsCards from './StatsCards';
import CameraGrid from './CameraGrid';
import AlertPanel from './AlertPanel';
import SceneBriefing from './SceneBriefing';
import { getEventStats } from '../services/api';

export default function Dashboard({
  alerts = [],
  frames = {},
  detectionUpdates = {},
  cameraStatuses = {},
  sceneBriefings = {},
  emitStartCamera,
  emitStopCamera,
  clearAlerts,
}) {
  const [eventStats, setEventStats] = useState(null);

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
    <div className="dashboard-container">
      <StatsCards stats={stats} />

      <div className="tactical-layout">
        <div className="video-section">
          <CameraGrid
            frames={frames || {}}
            detectionUpdates={detectionUpdates || {}}
            cameraStatuses={cameraStatuses || {}}
            emitStartCamera={emitStartCamera}
            emitStopCamera={emitStopCamera}
          />
        </div>
        
        <div className="intelligence-column">
          <SceneBriefing briefings={sceneBriefings || {}} />
          <AlertPanel alerts={alerts || []} onClear={clearAlerts} />
        </div>
      </div>
    </div>
  );
}
