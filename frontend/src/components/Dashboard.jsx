import { useState, useEffect, useMemo } from 'react';
import StatsCards from './StatsCards';
import CameraGrid from './CameraGrid';
import AlertPanel from './AlertPanel';
import { getEventStats } from '../services/api';

export default function Dashboard({
  alerts,
  frames,
  detectionUpdates,
  cameraStatuses,
  emitStartCamera,
  emitStopCamera,
  clearAlerts,
}) {
  const [eventStats, setEventStats] = useState({});

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 15000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const stats = await getEventStats();
      setEventStats(stats);
    } catch (err) {
      // silently fail - stats are not critical
    }
  };

  const stats = useMemo(() => {
    const activeCount = Object.keys(cameraStatuses).filter(
      (k) => cameraStatuses[k] === 'streaming'
    ).length;

    const totalPersons = Object.values(detectionUpdates).reduce(
      (sum, d) => sum + (d?.persons || 0),
      0
    );

    return {
      activeCameras: activeCount || Object.keys(frames).length,
      totalEvents: eventStats.total_events || 0,
      criticalAlerts: eventStats.by_severity?.critical || 0,
      personsDetected: totalPersons,
    };
  }, [cameraStatuses, frames, detectionUpdates, eventStats]);

  return (
    <div className="dashboard-grid">
      <StatsCards stats={stats} />

      <CameraGrid
        frames={frames}
        detectionUpdates={detectionUpdates}
        cameraStatuses={cameraStatuses}
        emitStartCamera={emitStartCamera}
        emitStopCamera={emitStopCamera}
      />

      <AlertPanel alerts={alerts} onClear={clearAlerts} />
    </div>
  );
}
