import {
  LayoutDashboard,
  Camera,
  Bell,
  FileText,
  Settings,
  LogOut,
  Target,
  FileVideo,
  User,
  Activity,
  Zap,
  Radar,
  Radio
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'analysis', label: 'Analysis', icon: FileVideo },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'events', label: 'Events', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  return (
    <aside className="sidebar" style={{ 
      position: 'relative', 
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #040608 0%, #020305 100%)',
      borderRight: '1px solid rgba(59, 130, 246, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '10px 0 30px rgba(0,0,0,0.5)'
    }}>

      <style>{`
        .sidebar::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 20px 20px;
          pointer-events: none;
          opacity: 0.3;
        }
        .sidebar-header-professional {
          padding: 32px 24px;
          background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 100%);
          position: relative;
        }
        .nav-mission-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 24px;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          color: rgba(255,255,255,0.5);
          position: relative;
          text-transform: uppercase;
          font-family: var(--font-mono);
          letter-spacing: 0.1em;
          font-size: 0.65rem;
          font-weight: 800;
        }
        .nav-mission-item:hover {
          color: #fff;
          background: rgba(255,255,255,0.02);
          padding-left: 28px;
        }
        .nav-mission-item.active {
          color: var(--accent-primary);
          background: rgba(59, 130, 246, 0.05);
          padding-left: 32px;
        }
        .nav-mission-item.active::before {
          content: "";
          position: absolute;
          left: 0;
          top: 15%;
          height: 70%;
          width: 3px;
          background: var(--accent-primary);
          box-shadow: 0 0 15px var(--accent-primary);
        }
        .nav-mission-item.active .nav-icon {
          filter: drop-shadow(0 0 8px var(--accent-primary));
        }
        .section-separator {
          padding: 32px 24px 12px;
          font-size: 0.55rem;
          font-weight: 900;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          opacity: 0.6;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .section-separator::after {
          content: "";
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.2), transparent);
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        .radar-scan {
          position: relative;
          overflow: hidden;
        }
        .radar-scan::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 40%;
          background: linear-gradient(180deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          animation: scanline 2s linear infinite;
          pointer-events: none;
        }
      `}</style>

      <div className="sidebar-header-professional">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="radar-scan" style={{ 
              width: 52, 
              height: 52, 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.05) 100%)', 
              borderRadius: 14, 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.1)',
              position: 'relative'
            }}>
              <Radar size={28} color="var(--accent-primary)" strokeWidth={1.5} />
              <div style={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: '#10b981', borderRadius: '50%', border: '2px solid #050810', boxShadow: '0 0 10px #10b981' }} />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <h2 style={{ 
                fontSize: '1.2rem', 
                fontWeight: 1000, 
                textTransform: 'uppercase', 
                letterSpacing: '0.2em', 
                color: '#fff', 
                margin: 0,
                lineHeight: 1,
                fontFamily: 'var(--font-main)',
                textShadow: '0 0 20px rgba(255,255,255,0.1)'
              }}>Sentinel</h2>
              <div style={{ 
                fontSize: '0.55rem', 
                fontWeight: 900, 
                color: 'var(--accent-cyan)', 
                marginTop: 6,
                letterSpacing: '0.05em',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '2px 8px',
                borderRadius: 4,
                display: 'inline-block',
                border: '1px solid rgba(59, 130, 246, 0.15)'
              }}>
                CORE_ENGINE_V8.4
              </div>
            </div>
          </div>
          
          <div style={{ 
            marginTop: 4,
            padding: '10px 14px',
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={12} color="#10b981" />
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: '#10b981', letterSpacing: '0.05em' }}>SYS_ACTIVE</span>
            </div>
            <div style={{ width: 1, height: 10, background: 'rgba(255,255,255,0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={12} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>UDP_LOCKED</span>
            </div>
          </div>
        </div>
      </div>


      <div className="section-separator">MISSION_COMMAND</div>
      <nav style={{ flex: 1, paddingTop: 8 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <div
              key={item.id}
              className={`nav-mission-item ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon size={16} className="nav-icon" style={{ opacity: isActive ? 1 : 0.6 }} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer" style={{ 
        borderTop: '1px solid rgba(255,255,255,0.05)', 
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.6) 100%)', 
        padding: '24px',
        position: 'relative'
      }}>
        <style>{`
          @keyframes statusPulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); opacity: 0.8; }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); opacity: 1; }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); opacity: 0.8; }
          }
          .status-pulse-dot {
            position: absolute;
            bottom: -3px;
            right: -3px;
            width: 12px;
            height: 12px;
            background: #10b981;
            border-radius: 50%;
            border: 2px solid #050810;
            animation: statusPulse 2s infinite;
          }
          .terminate-session-btn:hover {
            background: linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(225, 29, 72, 0.2) 100%) !important;
            border-color: rgba(244, 63, 94, 0.6) !important;
            color: #fff !important;
            box-shadow: 0 0 35px rgba(244, 63, 94, 0.25) !important;
            transform: translateY(-2px);
            letter-spacing: 0.25em !important;
          }
          .terminate-session-btn:active {
            transform: scale(0.96);
          }
          .user-avatar-professional:hover {
            border-color: var(--accent-primary) !important;
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.15) !important;
          }
        `}</style>
        <div style={{ position: 'absolute', top: 0, left: 10, right: 10, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.2), transparent)' }}></div>
        
        <div className="user-info" style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div className="user-avatar-professional" style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            background: 'rgba(59, 130, 246, 0.08)', 
            color: 'var(--accent-primary)', 
            border: '1px solid rgba(59, 130, 246, 0.25)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            boxShadow: 'inset 0 0 15px rgba(59, 130, 246, 0.1)',
            position: 'relative',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}>
            <User size={22} strokeWidth={2.5} />
            <div className="status-pulse-dot" />
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 1000, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'var(--font-main)' }}>
                {user?.username || 'ADMIN'}
              </span>
            </div>
            <div style={{ fontSize: '0.5rem', color: 'var(--accent-cyan)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6, opacity: 0.8 }}>
              <Zap size={8} />
              <span>SITUATIONAL_COMMANDER</span>
            </div>
          </div>
        </div>
        
        <button 
          className="terminate-session-btn" 
          onClick={onLogout}
          style={{ 
            width: '100%', 
            background: 'rgba(244, 63, 94, 0.06)', 
            border: '1px solid rgba(244, 63, 94, 0.25)',
            color: 'rgba(244, 63, 94, 0.8)',
            padding: '14px',
            fontSize: '0.6rem',
            fontWeight: 1000,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '0.2em',
            transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(8px)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <LogOut size={16} strokeWidth={3} />
          <span>LOG OUT</span>
        </button>
      </div>



    </aside>
  );
}

