import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Header.css';
import { useAuth } from '../context/AuthContext.jsx';

function Header() {
  const { user } = useAuth();

  return (
    <header className="site-header">
      <Link to="/" className="logo">LegalConnect</Link>
      <div className="header-right">
        <nav>
          <NavLink to="/services" className={({ isActive }) => (isActive ? 'active' : '')}>Services</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => (isActive ? 'active' : '')}>Leaderboard</NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>Dashboard</NavLink>
        </nav>
        {!user ? (
          <Link to="/login?mode=login" className="login-cta">
            Login / Sign up
          </Link>
        ) : (
          <ProfileMenu />
        )}
      </div>
    </header>
  );
}

function ProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user?.fullName || user?.name || 'U')
    .split(' ')
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="profile-menu" ref={menuRef}>
      <button type="button" className="profile-trigger" onClick={() => setOpen(prev => !prev)}>
        <span className="profile-pill">{initials}</span>
        <span className="profile-name">{user?.fullName || user?.name || 'Profile'}</span>
      </button>
      {open && (
        <div className="profile-dropdown">
          <p className="profile-heading">Signed in as</p>
          <p className="profile-identity">{user?.fullName || user?.name}</p>
          <p className="profile-subtext">{user?.email}</p>
          <div className="profile-meta">
            <span>Role:</span>
            <strong>{formatRole(user?.role)}</strong>
          </div>
          <button
            type="button"
            className="profile-action"
            onClick={() => {
              setOpen(false);
              navigate('/profile');
            }}
          >
            View Profile
          </button>
          <button type="button" className="profile-action" onClick={() => { navigate('/dashboard'); setOpen(false); }}>
            Go to Dashboard
          </button>
          <button type="button" className="profile-action secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function formatRole(role = '') {
  return role
    .toString()
    .toLowerCase()
    .split('_')
    .map(chunk => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export default Header;
