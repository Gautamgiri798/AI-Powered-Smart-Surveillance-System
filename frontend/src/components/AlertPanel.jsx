import { Bell, ShieldAlert, Trash2, CheckCircle } from 'lucide-react';

export default function AlertPanel({ alerts, onClear }) {
  return (
    <div className="alert-panel card">
      <div className="card-header">
        <h3>
          <ShieldAlert size={18} style={{ color: 'var(--severity-critical)' }} />
          Live Alerts
          {alerts.length > 0 && (
            <span className="badge badge-critical" style={{ marginLeft: 4 }}>
              {alerts.length}
            </span>
          )}
        </h3>
        {alerts.length > 0 && (
          <button
            id="clear-alerts-btn"
            className="btn btn-ghost btn-sm"
            onClick={onClear}
          >
            <Trash2 size={13} />
            Clear
          </button>
        )}
      </div>

      <div className="card-body">
        {alerts.length === 0 ? (
          <div className="no-alerts">
            <CheckCircle size={40} />
            <p>No active alerts</p>
            <p style={{ fontSize: '0.75rem', marginTop: 4 }}>
              System is monitoring normally
            </p>
          </div>
        ) : (
          <div className="alert-list">
            {alerts.map((alert, idx) => (
              <div
                key={alert._id || idx}
                className={`alert-item ${alert.severity}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="alert-item-header">
                  <span className="alert-type">
                    {formatAlertType(alert.event_type)}
                  </span>
                  <span className={`badge badge-${alert.severity}`}>
                    {alert.severity}
                  </span>
                </div>
                <div className="alert-desc">{alert.description}</div>
                <div className="alert-meta">
                  <span>📷 {alert.camera_id}</span>
                  <span>🕐 {formatTime(alert.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function formatAlertType(type) {
  if (!type) return 'Unknown';
  return type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatTime(timestamp) {
  if (!timestamp) return '--';
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return timestamp;
  }
}
