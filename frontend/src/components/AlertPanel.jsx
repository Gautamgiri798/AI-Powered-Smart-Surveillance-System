import { Bell, ShieldCheck, Activity, Wifi, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function AlertPanel({ alerts = [], onClear }) {
  return (
    <div className="live-alerts-container" style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
      <div className="sidebar-section-header" style={{ padding: '24px 30px', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.05em' }}>
          <div className="status-led led-active" style={{ width: 6, height: 6 }} />
          LIVE INTELLIGENCE
        </h3>
        <div style={{ fontSize: '0.6rem', color: 'var(--accent-primary)', fontWeight: 800, letterSpacing: '0.15em', marginTop: 2 }}>
          REALTIME_INTEL_STREAM
        </div>
      </div>

      <div className="alert-list" style={{ padding: '10px 0', overflowY: 'auto', maxHeight: '500px' }}>
        {alerts.length === 0 ? (
          <div className="empty-state" style={{ padding: '80px 30px', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              <ShieldCheck size={48} style={{ color: 'var(--accent-green)', opacity: 0.1 }} />
              <div 
                className="pulse" 
                style={{ 
                  position: 'absolute', width: 30, height: 30, 
                  borderRadius: '50%', background: 'rgba(16, 185, 129, 0.05)', 
                  border: '1px solid rgba(16, 185, 129, 0.2)' 
                }} 
              />
            </div>
            <div className="empty-state-p">
              <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', letterSpacing: '0.1em', marginBottom: 4 }}>
                SITUATIONAL CLEAR
              </div>
              <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                MONITORING // 0 ACTIVE THREATS
              </div>
            </div>
          </div>
        ) : (
          alerts.map((alert, idx) => {
            const isCritical = alert.severity === 'critical' || alert.severity === 'high';
            const displayType = (alert.event_type || alert.type || 'TARGET_DETECTED').replace(/_/g, ' ').toUpperCase();
            
            let rawConf = alert.metadata?.confidence;
            if (rawConf === undefined || rawConf === null) rawConf = alert.confidence;
            const confidence = (Number(rawConf) || 0.85);

            return (
              <div key={alert.id || idx} className="alert-item animate-fade-in" style={{ 
                margin: '8px 20px', padding: '16px', 
                background: isCritical ? 'rgba(244, 63, 94, 0.04)' : 'rgba(255,255,255,0.01)', 
                borderRadius: 12, border: `1px solid ${isCritical ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.03)'}` 
              }}>
                <div className="alert-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                  <div className="alert-title" style={{ 
                    fontSize: '0.65rem', fontWeight: 900, 
                    color: isCritical ? 'var(--accent-red)' : 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em'
                  }}>
                    {isCritical ? <AlertTriangle size={12} /> : <ShieldAlert size={12} />}
                    {displayType}
                  </div>
                  <div className="alert-meta" style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {(alert.timestamp || 'NOW').split('T').pop()?.substring(0, 8)}
                  </div>
                </div>
                <div className="alert-desc" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                  <span style={{ color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', fontSize: '0.55rem', fontWeight: 900, fontFamily: 'var(--font-mono)' }}>[NODE_{alert.camera_id || '01'}] </span>
                  {alert.description || 'Situational anomaly detected.'}
                </div>
                <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ height: 2, flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                    <div style={{ height: '100%', width: `${confidence * 100}%`, background: isCritical ? 'var(--accent-red)' : 'var(--accent-primary)', opacity: 0.6, borderRadius: 10 }} />
                  </div>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{(confidence * 100).toFixed(0)}%_CONF</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {alerts.length > 0 && (
        <div style={{ padding: '24px 30px', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <button 
            className="mission-action-btn btn-purge-elite" 
            style={{ width: '100%', padding: '12px', fontSize: '0.65rem' }}
            onClick={onClear}
          >
             PURGE MISSION LOGS
          </button>
        </div>
      )}
    </div>
  );
}
