import { Activity } from 'lucide-react';

export default function ActivityMonitor({ alerts = [], liveBehaviors = {} }) {
  // Detailed Category Mapping as requested
  const CATEGORIES = {
    'BASIC': ['standing', 'walking', 'sitting'],
    'MOVEMENT': ['running', 'aggressive_running', 'sudden_stop'],
    'TIME_BASED': ['loitering', 'idle'],
    'ZONE_BASED': ['intrusion', 'line_crossing'],
    'SUSPICIOUS': ['weapon_threat', 'abandoned_object'],
    'INTERACTION': ['fight_detected', 'crowd_density', 'following'],
    'POSE_BASED': ['sustained_fall', 'erratic_behavior', 'waving', 'hands_on_head'],
    'CONTEXTUAL': ['phoning', 'night_activity', 'anomaly'],
  };

  // Extract and deduplicate live behaviors + recent alerts
  const allLive = Object.values(liveBehaviors).flat();
  const allSource = [...allLive, ...alerts.map(a => ({ ...a, type: a.event_type || a.type }))];
  
  // Group activities
  const grouped = {};
  Object.entries(CATEGORIES).forEach(([cat, types]) => {
    const matching = allSource.find(a => types.includes(a.type));
    if (matching) grouped[cat] = matching;
  });

  return (
    <div className="activity-monitor-card" style={{ 
      background: 'rgba(15, 23, 42, 0.6)', 
      borderRadius: 24, 
      border: '1px solid rgba(255,255,255,0.08)', 
      marginBottom: 20,
      backdropFilter: 'blur(10px)',
      overflow: 'hidden' 
    }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Activity size={18} color="var(--accent-cyan)" />
        <div>
          <h3 style={{ fontSize: '0.75rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Dynamic Activity Matrix</h3>
          <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.1em' }}>SENTRY_V8.4_HAR_CLASSIFIER</div>
        </div>
      </div>

      <div style={{ padding: '12px 0' }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.65rem', fontWeight: 700 }}>
             AWAITING SIGNAL... NO ACTIVE ANOMALIES.
          </div>
        ) : (
          Object.entries(grouped).map(([category, activity], idx) => (
            <div key={idx} style={{ 
              padding: '10px 24px', 
              borderBottom: idx !== Object.keys(grouped).length - 1 ? '1px solid rgba(255,255,255,0.02)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{category}</span>
                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.3)', fontFamily: 'var(--font-mono)' }}>ID_{activity.track_id || 'SYS'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: activity.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-cyan)' }} />
                <span style={{ fontSize: '0.75rem', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>
                    {activity.type?.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{ padding: '12px 24px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div className="status-led led-active" style={{ width: 4, height: 4 }} />
            <span style={{ fontSize: '0.5rem', fontWeight: 800, color: 'var(--text-muted)' }}>BIO_METRIC_ENGINE_NOMINAL</span>
         </div>
         <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>{new Date().toLocaleTimeString()}</span>
      </div>
    </div>
  );
}
