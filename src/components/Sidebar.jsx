import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const LogoutIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('cliqd_theme') !== 'light';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('cliqd_theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      localStorage.setItem('cliqd_theme', 'light');
    }
  }, [isDark]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', icon: <HomeIcon />, label: 'Home', cls: 'nav-home' },
    { to: '/create', icon: <PlusIcon />, label: 'Create', cls: 'nav-create' },
    { to: `/profile/${user?.username}`, icon: <UserIcon />, label: 'Profile', cls: 'nav-profile' },
  ];

  const SidebarContent = () => (
    <>
      <div className="sidebar-logo" onClick={() => { navigate('/'); setMobileOpen(false); }}>
        <span className="logo-mark">C</span>
        <span className="logo-text">cliqd</span>
      </div>

      {user && (
        <div className="sidebar-user" onClick={() => { navigate(`/profile/${user.username}`); setMobileOpen(false); }}>
          <img src={user.avatar} alt={user.name} className="sidebar-avatar" />
          <div className="sidebar-user-info">
            <span className="sidebar-name">{user.name}</span>
            <span className="sidebar-handle">@{user.username}</span>
          </div>
        </div>
      )}

      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${item.cls} ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <button className="theme-toggle" onClick={() => setIsDark(!isDark)}>
        <div className={`theme-toggle-track ${isDark ? 'dark' : 'light'}`}>
          <span className="theme-toggle-thumb">
            {isDark ? <MoonIcon /> : <SunIcon />}
          </span>
        </div>
        <span className="theme-toggle-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
      </button>

      <button className="sidebar-logout" onClick={handleLogout}>
        <LogoutIcon />
        <span>Sign Out</span>
      </button>
    </>
  );

  return (
    <>
      <div className="mobile-topbar">
        <div className="mobile-logo" onClick={() => navigate('/')}>
          <span className="logo-mark">C</span>
          <span className="logo-text">cliqd</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <button className="mobile-theme-btn" onClick={() => setIsDark(!isDark)}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            <MenuIcon />
          </button>
        </div>
      </div>

      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
