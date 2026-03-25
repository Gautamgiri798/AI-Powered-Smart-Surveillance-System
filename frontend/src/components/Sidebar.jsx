import {
  LayoutDashboard,
  Camera,
  Bell,
  FileText,
  Settings,
  LogOut,
  Shield
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cameras', label: 'Cameras', icon: Camera },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'events', label: 'Event Log', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ activePage, onNavigate, user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Shield size={22} />
        </div>
        <div className="sidebar-brand">
          <h1>SentinelVision</h1>
          <p>AI Surveillance</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              id={`nav-${item.id}`}
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <Icon className="nav-icon" size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.full_name || user?.username || 'Admin'}</div>
            <div className="user-role">{user?.role || 'admin'}</div>
          </div>
        </div>
        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          style={{ width: '100%', marginTop: 8 }}
          onClick={onLogout}
        >
          <LogOut size={14} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
