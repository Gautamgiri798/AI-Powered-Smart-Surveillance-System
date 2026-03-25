import { useEffect, useState } from 'react';
import { getEvents, acknowledgeEvent } from '../services/api';
import { FileText, Check, RefreshCw } from 'lucide-react';

export default function EventLog() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const loadEvents = async () => {
    try {
      const params = {};
      if (filter !== 'all') params.severity = filter;
      const data = await getEvents(params);
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (eventId) => {
    try {
      await acknowledgeEvent(eventId);
      loadEvents();
    } catch (err) {
      console.error('Failed to acknowledge:', err);
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '--';
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return timestamp;
    }
  };

  return (
    <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div className="card-header">
        <h3>
          <FileText size={18} />
          Event Log
          <span className="badge badge-low" style={{ marginLeft: 4 }}>
            {events.length}
          </span>
        </h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select
            id="event-filter"
            className="input"
            style={{ width: 120, padding: '6px 10px', fontSize: '0.75rem' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <button
            id="refresh-events"
            className="btn btn-ghost btn-sm"
            onClick={loadEvents}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      <div className="card-body" style={{ flex: 1, overflow: 'auto', padding: 0 }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            No events found
          </div>
        ) : (
          <table className="event-log-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Camera</th>
                <th>Event</th>
                <th>Severity</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, idx) => (
                <tr key={event._id || idx}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatTime(event.timestamp)}
                  </td>
                  <td>{event.camera_id}</td>
                  <td style={{ fontWeight: 500 }}>
                    {event.event_type?.replace(/_/g, ' ')}
                  </td>
                  <td>
                    <span className={`badge badge-${event.severity}`}>
                      {event.severity}
                    </span>
                  </td>
                  <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {event.description}
                  </td>
                  <td>
                    {event.acknowledged ? (
                      <span style={{ color: 'var(--status-active)', fontSize: '0.75rem' }}>
                        ✓ Ack
                      </span>
                    ) : (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleAcknowledge(event._id)}
                        style={{ fontSize: '0.7rem', padding: '3px 8px' }}
                      >
                        <Check size={12} />
                        Ack
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
