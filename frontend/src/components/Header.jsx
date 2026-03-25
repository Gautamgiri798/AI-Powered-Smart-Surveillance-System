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
    <header className="header">
      <div className="header-left">
        <h2>{title}</h2>
      </div>
      <div className="header-right">
        <div className={`connection-status ${connected ? 'connected' : 'disconnected'}`}>
          <span className={`status-dot ${connected ? 'pulse' : ''}`} />
          {connected ? (
            <>
              <Wifi size={13} />
              Live
            </>
          ) : (
            <>
              <WifiOff size={13} />
              Offline
            </>
          )}
        </div>

        {alertCount > 0 && (
          <div
            className="connection-status"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--severity-critical)',
            }}
          >
            <Bell size={13} />
            {alertCount}
          </div>
        )}

        <div className="header-time">
          <div>{formattedTime}</div>
          <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>{formattedDate}</div>
        </div>
      </div>
    </header>
  );
}
