import {
  Camera,
  Shield,
  AlertTriangle,
  Users,
} from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      label: 'Active Cameras',
      value: stats.activeCameras ?? 0,
      icon: Camera,
      color: 'cyan',
      change: 'Real-time monitoring',
    },
    {
      label: 'Total Events',
      value: stats.totalEvents ?? 0,
      icon: AlertTriangle,
      color: 'orange',
      change: 'All time',
    },
    {
      label: 'Critical Alerts',
      value: stats.criticalAlerts ?? 0,
      icon: Shield,
      color: 'red',
      change: stats.criticalAlerts > 0 ? 'Action required' : 'All clear',
    },
    {
      label: 'Persons Detected',
      value: stats.personsDetected ?? 0,
      icon: Users,
      color: 'blue',
      change: 'In current session',
    },
  ];

  return (
    <div className="stats-row">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="stat-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className={`stat-icon ${card.color}`}>
              <Icon size={22} />
            </div>
            <div className="stat-info">
              <div className="stat-label">{card.label}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-change">{card.change}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
