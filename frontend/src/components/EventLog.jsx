import { useEffect, useState, useRef } from 'react';
import { getEvents, acknowledgeEvent, deleteEvent, clearEvents } from '../services/api';
import { FileText, Check, RefreshCw, ShieldAlert, ShieldAlert as AlertTriangle, Info, ShieldCheck, Activity, ChevronDown, Trash2 } from 'lucide-react';

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'ALL SEVERITIES' },
  { value: 'critical', label: 'CRITICAL ONLY' },
  { value: 'high', label: 'HIGH PRIORITY' },
  { value: 'medium', label: 'MEDIUM INTEL' },
  { value: 'low', label: 'LOW PRIORITY' },
];

export default function EventLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEvents = async () => {
    console.log('[LOG] 🔄 Initiating manual situational mission log refresh...');
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.severity = filter;
      const data = await getEvents(params);
      console.log('[LOG] ✅ Mission records retrieved:', data.events?.length || 0);
      setEvents(data.events || []);
    } catch (err) {
      console.error('[LOG] ❌ Forensic link failure:', err);
    } finally {
      setLoading(false);
    }
  };


  const handleAcknowledge = async (eventId) => {
    try {
      await acknowledgeEvent(eventId);
      await loadEvents();
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const handleDeleteIndividual = async (eventId) => {
    if (!window.confirm("CONFIRM SURGICAL DELETION OF THIS RECORD?")) return;
    try {
      await deleteEvent(eventId);
      await loadEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("WARNING: SECURE PURGE OF ALL MISSION RECORDS. PROCEED?")) return;
    try {
      await clearEvents();
      await loadEvents();
    } catch (err) {
      console.error('Failed to clear events:', err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--:--:--';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return timestamp; }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return <ShieldAlert size={14} color="var(--accent-red)" />;
      case 'high': return <AlertTriangle size={14} color="var(--accent-orange)" />;
      case 'medium': return <Activity size={14} color="var(--accent-blue)" />;
      case 'low': return <Info size={14} color="var(--text-muted)" />;
      default: return <Info size={14} />;
    }
  };

  const currentLabel = SEVERITY_OPTIONS.find(opt => opt.value === filter)?.label || 'ALL SEVERITIES';

  return (
    <div className="dashboard-container" style={{ maxWidth: 1200, margin: '0 0' }}>
      <style>{`
        .btn-elite-mission {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 800;
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
        }
        .btn-elite-mission:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
          transform: translateY(-1px);
        }
        .btn-elite-verify {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.2) 100%) !important;
          border-color: rgba(59, 130, 246, 0.3) !important;
          color: var(--accent-blue) !important;
        }
        .btn-elite-verify:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(37, 99, 235, 0.3) 100%) !important;
          border-color: var(--accent-blue) !important;
          box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
        }
        .btn-elite-purge {
          background: rgba(244, 63, 94, 0.05) !important;
          border-color: rgba(244, 63, 94, 0.15) !important;
          color: var(--accent-red) !important;
        }
        .btn-elite-purge:hover {
          background: rgba(244, 63, 94, 0.1) !important;
          border-color: var(--accent-red) !important;
          box-shadow: 0 0 15px rgba(244, 63, 94, 0.2);
        }
        .btn-elite-refresh {
          width: 40px;
          height: 40px;
          justify-content: center;
          padding: 0;
          border-radius: 50% !important;
        }
        .btn-elite-delete {
          width: 32px;
          height: 32px;
          justify-content: center;
          padding: 0;
          background: rgba(255,255,255,0.02) !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
        }
        .mission-select-container {
          position: relative;
          z-index: 100;
        }
        .mission-select-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 200px;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          margin-top: 8px;
          padding: 8px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          gap: 2px;
          animation: fadeIn 0.1s ease-out;
        }
        .mission-select-option {
          padding: 10px 14px;
          border-radius: 8px;
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .mission-select-option:hover {
          background: rgba(255, 255, 255, 0.04);
          color: #fff;
        }
        .mission-select-option.active {
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>


      <div className="camera-card" style={{ padding: 0, background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}>
        
        {/* Elite Terminal Header */}
        <div style={{ padding: '30px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
              <FileText size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', letterSpacing: '0.02em' }}>MISSION EVENT LOG</h2>
              <div className="badge" style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)', border: '1px solid rgba(99, 102, 241, 0.2)', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4 }}>
                {events.length} ACTIVE RECORDS
              </div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 500 }}>Forensic situational data from all connected nodes.</p>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <button 
              className="btn-elite-mission btn-elite-purge" 
              onClick={handleClearAll}
            >
              <Trash2 size={12} /> PURGE_LOGS
            </button>

            <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)', margin: '0 4px' }}></div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>FILTER:</label>
              
              {/* Custom High-Fidelity Select */}
              <div className="mission-select-container" ref={dropdownRef}>
                <div className="mission-select-trigger" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {currentLabel}
                  <ChevronDown size={14} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0)', transition: '0.2s' }} />
                </div>
                
                {isDropdownOpen && (
                  <div className="mission-select-dropdown" style={{ top: '110%' }}>
                    {SEVERITY_OPTIONS.map(opt => (
                      <div 
                        key={opt.value}
                        className={`mission-select-option ${filter === opt.value ? 'active' : ''}`}
                        onClick={() => {
                          setFilter(opt.value);
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: opt.value === 'critical' ? 'var(--accent-red)' : opt.value === 'high' ? 'var(--accent-orange)' : opt.value === 'medium' ? 'var(--accent-blue)' : 'var(--text-muted)' }}></div>
                        {opt.label}
                      </div>
                    ))}
                  </div>

                )}
              </div>
            </div>

            <button
              className="btn-elite-mission btn-elite-refresh"
              onClick={loadEvents}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
            </button>
          </div>
        </div>

        {/* Forensic Data Table — Scrollable Tactical Zone */}
        <div style={{ padding: '0 24px', maxHeight: '600px', overflowY: 'auto', position: 'relative' }}>
          {loading && events.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <RefreshCw size={32} className="spin" style={{ marginBottom: 16, opacity: 0.5 }} />
              <div>POLLING ANALYTICS CORE...</div>
            </div>
          ) : events.length === 0 ? (
            <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <ShieldCheck size={32} style={{ marginBottom: 16, opacity: 0.5 }} />
              <div>NO UNEXPECTED EVENTS DETECTED IN SELECTED STREAM.</div>
            </div>
          ) : (
            <table className="event-log-table">
              <thead style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 10 }}>
                <tr>
                  <th style={{ width: 100 }}>TIME</th>
                  <th style={{ width: 100 }}>NODE</th>
                  <th style={{ width: 160 }}>MISSION EVENT</th>
                  <th style={{ width: 120 }}>SEVERITY</th>
                  <th style={{ width: 'auto' }}>SITUATIONAL DESCRIPTION</th>
                  <th style={{ textAlign: 'right', width: 180 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, idx) => (
                  <tr key={event._id || idx} style={{ cursor: 'default' }}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent-cyan)', fontWeight: 800 }}>
                      {formatTime(event.timestamp)}
                    </td>
                    <td>
                      <code style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
                        {event.camera_id}
                      </code>
                    </td>
                    <td style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', color: '#fff' }}>
                      {event.event_type?.replace(/_/g, ' ')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: event.severity === 'critical' ? 'var(--accent-red)' : event.severity === 'high' ? 'var(--accent-orange)' : 'var(--accent-blue)', boxShadow: `0 0 8px ${event.severity === 'critical' ? 'var(--accent-red)' : ''}` }}></div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', color: event.severity === 'critical' ? 'var(--accent-red)' : 'var(--text-secondary)' }}>
                          {event.severity}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: '0.8rem', opacity: 0.8, color: 'var(--text-secondary)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span>{event.description}</span>
                        {event.frame_url && (
                          <div style={{ width: 80, height: 45, borderRadius: 4, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                            <img 
                              src={`http://localhost:5000${event.frame_url}`} 
                              alt="Crop" 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onClick={() => window.open(`http://localhost:5000${event.frame_url}`, '_blank')}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', alignItems: 'center' }}>
                        {event.acknowledged ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent-green)', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            <Check size={12} strokeWidth={3} /> VERIFIED
                          </div>
                        ) : (
                          <button
                            className="btn-elite-mission btn-elite-verify"
                            onClick={() => handleAcknowledge(event._id)}
                            style={{ padding: '6px 14px' }}
                          >
                            ACK
                          </button>
                        )}
                        <button 
                          className="btn-elite-mission btn-elite-delete"
                          onClick={() => handleDeleteIndividual(event._id)}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
}

