import { Camera, Activity, ShieldAlert, Users } from 'lucide-react';

export default function StatsCards({ stats }) {
  if (!stats) return null;

  return (
    <div className="mission-stats-grid">
      {/* Active Nodes */}
      <div className="mission-node-card active-node">
        <div className="mission-node-icon" style={{ color: 'var(--accent-blue)' }}>
          <Camera size={22} strokeWidth={2.5} />
        </div>
        <div className="mission-node-data">
          <div className="mission-node-label">ACTIVE_CAMERAS</div>
          <div className="mission-node-value">{stats.activeCameras ?? 0}</div>
          <div className="mission-node-sub">LIVE_VIDEO_FEEDS</div>
        </div>
      </div>

      {/* Intelligence Stream */}
      <div className="mission-node-card event-node">
        <div className="mission-node-icon" style={{ color: 'var(--accent-orange)' }}>
          <Activity size={22} strokeWidth={2.5} />
        </div>
        <div className="mission-node-data">
          <div className="mission-node-label">TOTAL_EVENTS</div>
          <div className="mission-node-value">{stats.totalEvents ?? 0}</div>
          <div className="mission-node-sub">LOGGED_SITUATIONS</div>
        </div>
      </div>

      {/* Threat Level */}
      <div className="mission-node-card alert-node">
        <div className="mission-node-icon" style={{ color: 'var(--accent-red)' }}>
          <ShieldAlert size={22} strokeWidth={2.5} />
        </div>
        <div className="mission-node-data">
          <div className="mission-node-label">SECURITY_ALERTS</div>
          <div className="mission-node-value">{stats.criticalAlerts ?? 0}</div>
          <div className="mission-node-sub">CRITICAL_THREATS</div>
        </div>
      </div>

      {/* Subject Identity */}
      <div className="mission-node-card intel-node">
        <div className="mission-node-icon" style={{ color: 'var(--accent-cyan)' }}>
          <Users size={22} strokeWidth={2.5} />
        </div>
        <div className="mission-node-data">
          <div className="mission-node-label">PEOPLE_COUNT</div>
          <div className="mission-node-value">{stats.personsDetected ?? 0}</div>
          <div className="mission-node-sub">IDENTIFIED_PERSONS</div>
        </div>
      </div>
    </div>


  );
}
