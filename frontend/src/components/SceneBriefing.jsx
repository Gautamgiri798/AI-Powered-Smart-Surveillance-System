import { Brain, Zap, Clock, ShieldAlert, Terminal, Activity, Search } from 'lucide-react';

export default function SceneBriefing({ briefings = {} }) {
  const activeBriefings = Object.values(briefings || {}).sort((a, b) => {
    return (b.intel_score || 0) - (a.intel_score || 0);
  });
  
  if (activeBriefings.length === 0) {
    return (
      <div className="briefing-terminal intel-scanning-placeholder">
        <div style={{ position: 'relative' }}>
          <Search size={32} style={{ color: 'var(--accent-primary)', opacity: 0.3 }} />
          <div className="pulse" style={{ position: 'absolute', top: -4, left: -4, width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(99, 102, 241, 0.2)' }} />
        </div>
        <div style={{ zIndex: 2 }}>
          <p style={{ color: '#fff', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.2em', marginBottom: 4 }}>
            INTEL_ACQUISITION_PENDING
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.05em' }}>
            WAITING FOR MULTIMODAL SCENE ANALYSIS...
          </p>
        </div>
      </div>
    );
  }

  const main = activeBriefings[0];
  if (!main) return null;

  const severityColor = (main.intel_score > 75) ? 'var(--accent-red)' : 
                        (main.intel_score > 40) ? 'var(--accent-orange)' : 
                        'var(--accent-green)';

  return (
    <div className="briefing-terminal animate-fade-in" style={{ borderLeft: `4px solid ${severityColor}` }}>
      <div className="camera-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Brain size={18} color="var(--accent-primary)" strokeWidth={2.5} />
          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>
            SCENE_INTELLIGENCE
          </span>
        </div>
        <div style={{ 
          display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6rem', fontWeight: 900, 
          color: severityColor, background: 'rgba(255,255,255,0.03)', padding: '6px 14px', borderRadius: 4,
          border: `1px solid ${severityColor}33`
        }}>
          <Zap size={10} fill={severityColor} />
          <span>LVL_{main.intel_score || 0}%</span>
        </div>
      </div>

      <div style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Activity size={12} color="var(--accent-green)" />
          <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
            SOURCE_NODE: {(main.camera_name || 'SYSTEM_CORE').toUpperCase()}
          </span>
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>
          {main.summary || 'Executing structural breakdown of the visual theater...'}
        </p>

        <div style={{ 
          background: 'rgba(255,255,255,0.02)', borderLeft: `2px solid ${severityColor}`, 
          padding: '16px', borderRadius: 4, marginBottom: 24 
        }}>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: severityColor, letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>
            Tactical Advisory // Forensics
          </div>
          <p style={{ fontSize: '0.75rem', color: '#fff', lineHeight: 1.5, opacity: 0.9 }}>
            {main.advisory || 'Maintain active situational monitoring within the detected node sector.'}
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
            <Clock size={10} />
            <span>TIMESTAMP: {main.timestamp || 'REALTIME'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.6rem', color: 'var(--accent-cyan)', fontWeight: 900, letterSpacing: '0.05em' }}>
            <ShieldAlert size={12} />
            <span>CONFIRMATORY_INTEL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
