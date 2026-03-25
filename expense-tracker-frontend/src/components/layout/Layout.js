import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', icon: '◈', label: 'Dashboard' },
  { to: '/expenses',  icon: '≡', label: 'All Expenses' },
  { to: '/expenses/add', icon: '+', label: 'Add Expense' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="app-layout">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99 }}
        />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">💸</div>
          <span className="sidebar-logo-text">SpendWise</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-label">Main Menu</div>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div className="user-name">{user?.name}</div>
              <div className="user-email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-secondary btn-full btn-sm" onClick={handleLogout}>
            ⇤ &nbsp;Logout
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <button
            className="btn btn-secondary btn-icon"
            onClick={() => setSidebarOpen(v => !v)}
            style={{ display: 'none' }}
            id="menu-btn"
          >☰</button>
          <div />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="user-avatar" style={{ width: 30, height: 30, fontSize: '0.75rem' }}>{initials}</div>
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{user?.name}</span>
          </div>
        </header>
        <main className="page-content animate-fadeup">
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #menu-btn { display: inline-flex !important; }
        }
      `}</style>
    </div>
  );
}
