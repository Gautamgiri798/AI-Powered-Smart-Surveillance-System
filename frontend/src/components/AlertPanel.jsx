import { useState, useMemo } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Crosshair, Eye, Users, PersonStanding, Footprints, Activity, Smartphone, Moon, Clock, Package, Trash2 } from 'lucide-react';
import { clearEvents, deleteEvent } from '../services/api';

// Map behavior types to visual display config
const BEHAVIOR_CONFIG = {
  // Postures
  standing:        { icon: PersonStanding, label: 'STANDING',       color: '#22d3ee', bg: 'rgba(34,211,238,0.10)', group: 'posture' },
  walking:         { icon: Footprints,     label: 'WALKING',        color: '#38bdf8', bg: 'rgba(56,189,248,0.10)', group: 'posture' },
  sitting:         { icon: Users,          label: 'SITTING',        color: '#818cf8', bg: 'rgba(129,140,248,0.10)', group: 'posture' },
  lying:           { icon: Activity,       label: 'LYING DOWN',     color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', group: 'posture' },
  monitoring:      { icon: Eye,            label: 'MONITORING',     color: '#64748b', bg: 'rgba(100,116,139,0.10)', group: 'posture' },

  // Movement
  running:         { icon: Footprints,     label: 'RUNNING',        color: '#f97316', bg: 'rgba(249,115,22,0.12)', group: 'movement' },
  
  // Behaviors  
  phoning:         { icon: Smartphone,     label: 'USING PHONE',    color: '#a78bfa', bg: 'rgba(167,139,250,0.10)', group: 'behavior' },
  loitering:       { icon: Clock,          label: 'LOITERING',      color: '#fbbf24', bg: 'rgba(251,191,36,0.10)', group: 'behavior' },
  sleeping:        { icon: Moon,           label: 'SLEEPING',       color: '#c084fc', bg: 'rgba(192,132,252,0.10)', group: 'behavior' },
  holding_object:  { icon: Package,        label: 'HOLDING OBJECT', color: '#10b981', bg: 'rgba(16,185,129,0.10)', group: 'behavior' },
  
  // Threats
  weapon_threat:   { icon: Crosshair,      label: 'WEAPON DETECTED',color: '#ef4444', bg: 'rgba(239,68,68,0.15)', group: 'threat' },
  posture_anomaly: { icon: AlertTriangle,   label: 'PERSON DOWN',    color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', group: 'threat' },
  
  // Occupancy
  person_detected: { icon: Users,          label: 'PERSONS IN SCENE',color: '#3b82f6', bg: 'rgba(59,130,246,0.10)', group: 'info' },
};

const GROUP_ORDER = ['threat', 'movement', 'behavior', 'posture', 'info'];
const GROUP_LABELS = {
  threat: '⚠️ THREATS',
  movement: '🏃 MOVEMENT',
  behavior: '👁️ BEHAVIORS',
  posture: '🧍 POSTURES',
  info: '📊 OCCUPANCY',
};

function getSeverityColor(severity) {
  switch (severity) {
    case 'critical': return '#ef4444';
    case 'high': return '#f97316';
    case 'medium': return '#f59e0b';
    case 'low': return '#3b82f6';
    default: return '#64748b';
  }
}

export default function AlertPanel({ 
  alerts = [], 
  liveBehaviors = {}, 
  onClear, 
  onRemove, 
  horizontal = false,
  forceHistory = false 
}) {
  const [tab, setTab] = useState(forceHistory ? 'history' : 'live');

  const handleClearAll = async () => {
    try {
      await clearEvents();
      if (onClear) onClear();
    } catch (e) {
      console.error('Failed to clear ALL alerts from backend', e);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await deleteEvent(id);
      if (onRemove) onRemove(id);
    } catch (e) {
      console.error('Failed to delete alert from backend', e);
    }
  };

  // Extract ALL live behaviors from all cameras into a flat, grouped list
  const liveFeed = useMemo(() => {
    const all = [];
    Object.entries(liveBehaviors).forEach(([camId, behaviors]) => {
      if (!Array.isArray(behaviors)) return;
      behaviors.forEach(b => {
        if (b.type === 'status_update') return;
        all.push({ ...b, camera_id: camId });
      });
    });
    return all;
  }, [liveBehaviors]);

  // Group live feed by category
  const groupedLive = useMemo(() => {
    const groups = {};
    liveFeed.forEach(b => {
      const config = BEHAVIOR_CONFIG[b.type];
      const group = config?.group || 'info';
      if (!groups[group]) groups[group] = [];
      groups[group].push({ ...b, config });
    });
    return groups;
  }, [liveFeed]);

  if (horizontal) {
    return (
      <div style={{ 
        display: 'flex', alignItems: 'center', gap: 20, 
        background: 'rgba(15, 23, 42, 0.4)', borderRadius: 16, 
        border: '1px solid rgba(255,255,255,0.05)', padding: '12px 24px',
        marginBottom: 24, overflow: 'hidden', minHeight: 64
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderRight: '1px solid rgba(255,255,255,0.05)', paddingRight: 20, flexShrink: 0 }}>
          <ShieldAlert size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#fff', letterSpacing: '0.1em' }}>LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', flex: 1, scrollbarWidth: 'none' }}>
          {liveFeed.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={14} color="var(--accent-green)" />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700 }}>All Clear</span>
            </div>
          ) : (
            liveFeed.slice(0, 8).map((b, i) => {
              const cfg = BEHAVIOR_CONFIG[b.type] || {};
              return (
                <span key={i} style={{ fontSize: '0.6rem', fontWeight: 900, color: cfg.color || '#fff', background: cfg.bg || 'rgba(255,255,255,0.05)', padding: '4px 12px', borderRadius: 6, whiteSpace: 'nowrap' }}>
                  {cfg.label || b.type?.replace(/_/g, ' ').toUpperCase()}
                </span>
              );
            })
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: 'rgba(15, 23, 42, 0.4)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', height: '100%' }}>
      
      {/* Header with tabs */}
      <div style={{ padding: '20px 24px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 10, letterSpacing: '0.05em', marginBottom: 16 }}>
          <div className="status-led led-active" style={{ width: 6, height: 6 }} />
          {forceHistory ? 'HISTORICAL MISSION ALERTS' : 'LIVE DETECTION FEED'}
        </h3>
        
        {!forceHistory && (
          <div style={{ display: 'flex', gap: 0 }}>
            <button 
              onClick={() => setTab('live')}
              style={{ 
                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                background: tab === 'live' ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: tab === 'live' ? '#3b82f6' : 'rgba(255,255,255,0.35)',
                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em',
                borderBottom: tab === 'live' ? '2px solid #3b82f6' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              🔴 REAL-TIME ({liveFeed.length})
            </button>
            <button 
              onClick={() => setTab('history')}
              style={{ 
                flex: 1, padding: '10px', border: 'none', cursor: 'pointer',
                background: tab === 'history' ? 'rgba(99,102,241,0.1)' : 'transparent',
                color: tab === 'history' ? '#818cf8' : 'rgba(255,255,255,0.35)',
                fontSize: '0.6rem', fontWeight: 900, letterSpacing: '0.1em',
                borderBottom: tab === 'history' ? '2px solid #818cf8' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              📋 ALERT LOG ({alerts.length})
            </button>
          </div>
        )}
      </div>

      {/* Content area */}
      <div style={{ overflowY: 'auto', flex: 1, maxHeight: forceHistory ? 'none' : '500px' }}>
        
        {/* ─── LIVE TAB ─── */}
        {tab === 'live' && (
          <div style={{ padding: '8px 0' }}>
            {liveFeed.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <ShieldCheck size={40} style={{ color: 'var(--accent-green)', opacity: 0.15, marginBottom: 16 }} />
                <div style={{ fontWeight: 800, fontSize: '0.7rem', color: '#fff', letterSpacing: '0.1em', marginBottom: 4 }}>AWAITING DETECTIONS</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700 }}>Start a camera to see live activity</div>
              </div>
            ) : (
              GROUP_ORDER.map(group => {
                const items = groupedLive[group];
                if (!items || items.length === 0) return null;
                return (
                  <div key={group} style={{ marginBottom: 4 }}>
                    {/* Group header */}
                    <div style={{ padding: '12px 24px 6px', fontSize: '0.55rem', fontWeight: 900, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.12em' }}>
                      {GROUP_LABELS[group]}
                    </div>
                    {/* Items */}
                    {items.map((b, idx) => {
                      const cfg = b.config || BEHAVIOR_CONFIG[b.type] || {};
                      const Icon = cfg.icon || Activity;
                      const sevColor = getSeverityColor(b.severity);
                      return (
                        <div key={`${group}-${idx}`} style={{
                          margin: '4px 16px', padding: '12px 16px',
                          background: cfg.bg || 'rgba(255,255,255,0.02)',
                          borderRadius: 12,
                          border: `1px solid ${group === 'threat' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.03)'}`,
                          display: 'flex', alignItems: 'center', gap: 14,
                          animation: 'fadeIn 0.3s ease-out'
                        }}>
                          {/* Icon */}
                          <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `${cfg.color || '#3b82f6'}15`,
                            border: `1px solid ${cfg.color || '#3b82f6'}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Icon size={16} color={cfg.color || '#3b82f6'} />
                          </div>
                          
                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: cfg.color || '#fff', letterSpacing: '0.03em' }}>
                                {cfg.label || b.type?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              {b.track_id != null && (
                                <span style={{ fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                                  ID:{b.track_id}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {b.description || `Detected on camera ${b.camera_id}`}
                            </div>
                          </div>

                          {/* Severity dot */}
                          <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: sevColor,
                            boxShadow: group === 'threat' ? `0 0 8px ${sevColor}` : 'none',
                            flexShrink: 0
                          }} />
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ─── HISTORY TAB ─── */}
        {tab === 'history' && (
          <div style={{ padding: '8px 0' }}>
            {alerts.length === 0 ? (
              <div style={{ padding: '60px 24px', textAlign: 'center' }}>
                <ShieldCheck size={40} style={{ color: 'var(--accent-green)', opacity: 0.15, marginBottom: 16 }} />
                <div style={{ fontWeight: 800, fontSize: '0.7rem', color: '#fff', letterSpacing: '0.1em', marginBottom: 4 }}>NO RECORDED ALERTS</div>
                <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 700 }}>Alert history will appear here</div>
              </div>
            ) : (
              alerts.map((alert, idx) => {
                const isCritical = alert.severity === 'critical' || alert.severity === 'high';
                const displayType = (alert.event_type || alert.type || 'DETECTED').replace(/_/g, ' ').toUpperCase();
                const cfg = BEHAVIOR_CONFIG[alert.event_type || alert.type] || {};
                
                let rawConf = alert.metadata?.confidence;
                if (rawConf === undefined || rawConf === null) rawConf = alert.confidence;
                const confidence = (Number(rawConf) || 0.85);

                return (
                  <div key={alert.id || idx} style={{ 
                    margin: '6px 16px', padding: '14px 16px', 
                    background: isCritical ? 'rgba(244, 63, 94, 0.04)' : 'rgba(255,255,255,0.01)', 
                    borderRadius: 12, border: `1px solid ${isCritical ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.03)'}` 
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div style={{ 
                        fontSize: '0.65rem', fontWeight: 900, 
                        color: isCritical ? '#ef4444' : cfg.color || 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '0.05em'
                      }}>
                        {isCritical ? <AlertTriangle size={12} /> : <ShieldAlert size={12} />}
                        {displayType}
                      </div>
                      <div style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        {alert.timestamp ? new Date(alert.timestamp).toLocaleTimeString([], { hour12: false }) : 'NOW'}
                      </div>
                      
                      {/* Delete icon */}
                      <button 
                        onClick={() => handleDelete(alert.id || alert.event_id)}
                        className="alert-delete-btn"
                        style={{
                          background: 'transparent', border: 'none', color: 'var(--text-muted)', 
                          marginLeft: 12, padding: 4, cursor: 'pointer', opacity: 0.5,
                          transition: 'all 0.2s'
                        }}
                        title="Delete Alert"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    
                    {/* Severity badge */}
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 900, 
                        color: getSeverityColor(alert.severity),
                        background: `${getSeverityColor(alert.severity)}18`,
                        padding: '2px 8px', borderRadius: 4, letterSpacing: '0.08em',
                        border: `1px solid ${getSeverityColor(alert.severity)}30`
                      }}>
                        {(alert.severity || 'info').toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '0.5rem', fontWeight: 800, color: 'rgba(255,255,255,0.2)',
                        padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.03)'
                      }}>
                        CAM_{alert.camera_id || '01'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', lineHeight: 1.5, fontWeight: 500 }}>
                      {alert.description || 'Anomaly detected.'}
                    </div>

                    {/* Confidence bar */}
                    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ height: 2, flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                        <div style={{ height: '100%', width: `${confidence * 100}%`, background: isCritical ? '#ef4444' : '#3b82f6', opacity: 0.5, borderRadius: 10 }} />
                      </div>
                      <span style={{ fontSize: '0.5rem', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{(confidence * 100).toFixed(0)}%</span>
                    </div>

                    {/* Forensic Image Capture Preview */}
                    {alert.frame_url && (
                      <div style={{ marginTop: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', cursor: 'zoom-in' }}>
                        <img 
                          src={`http://localhost:5000${alert.frame_url}`} 
                          alt="Forensic Capture"
                          style={{ width: '100%', height: 'auto', display: 'block', transition: 'transform 0.3s' }}
                          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                          onError={e => e.target.style.display = 'none'}
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {tab === 'history' && alerts.length > 0 && (
        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <button 
            style={{ 
              width: '100%', padding: '10px', fontSize: '0.6rem', fontWeight: 900,
              background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
              color: '#f43f5e', borderRadius: 10, cursor: 'pointer', letterSpacing: '0.1em',
              transition: 'all 0.2s'
            }}
            onClick={handleClearAll}
          >
            CLEAR ALL ALERTS
          </button>
        </div>
      )}
    </div>
  );
}
