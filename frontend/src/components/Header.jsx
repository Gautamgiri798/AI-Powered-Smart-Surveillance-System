import { useState, useEffect } from 'react';
import { Bell, Wifi, WifiOff } from 'lucide-react';

export default function Header({ title, connected, alertCount }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="header" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between', 
      padding: '0 40px', 
      background: '#040608', 
      height: '72px',
      borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      position: 'relative',
      zIndex: 10
    }}>


      <div className="header-left">
        <h2 style={{ fontSize: '1rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#fff' }}>{title}</h2>
      </div>
      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`} style={{ fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', padding: '6px 14px', borderRadius: 8, gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: connected ? 'var(--accent-green)' : 'var(--accent-red)', boxShadow: connected ? '0 0 10px var(--accent-green)' : 'none', animation: connected ? 'pulse 2s infinite' : 'none' }}></div>
          {connected ? 'LIVE_CORE_ACTIVE' : 'SYSTEM_OFFLINE'}
        </div>

        {alertCount > 0 && (
          <div
            className="connection-status"
            style={{
              background: 'rgba(244, 63, 94, 0.1)',
              color: 'var(--accent-red)',
              fontSize: '0.65rem',
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '6px 14px',
              borderRadius: 8,
              gap: 8,
              border: '1px solid rgba(244, 63, 94, 0.2)'
            }}
          >
            <Bell size={13} strokeWidth={3} className="pulse" />
            {alertCount} THREATS
          </div>
        )}

        <div className="header-time" style={{ textAlign: 'right', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: 24 }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>{formattedTime}</div>
          <div style={{ fontSize: '0.55rem', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{formattedDate}</div>
        </div>
      </div>
    </header>
  );
}

