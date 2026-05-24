import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Upload as UploadIcon,
  BarChart2,
  Bell,
  History,
  PlaySquare,
  ThumbsUp,
  Settings as SettingsIcon,
  Home
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const navItems = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/upload', icon: <UploadIcon size={20} />, label: 'Upload' },
    { to: '/dashboard', icon: <BarChart2 size={20} />, label: 'Dashboard' },
    { to: '/history', icon: <History size={20} />, label: 'History' },
    { to: '/subscriptions', icon: <PlaySquare size={20} />, label: 'Subscriptions' },
    { to: '/liked', icon: <ThumbsUp size={20} />, label: 'Liked' },
    { to: '/settings', icon: <SettingsIcon size={20} />, label: 'Settings' },
  ];

  return (
    <aside className="sidebar glass">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <style>{`
        .sidebar {
          position: fixed;
          top: 70px;
          left: 0;
          bottom: 0;
          width: 200px;
          padding: 16px 12px;
          z-index: 90;
          display: flex;
          flex-direction: column;
          border-right: 1px solid var(--glass-border);
          border-top: none;
          border-left: none;
          border-bottom: none;
          border-radius: 0;
          overflow-y: auto;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.95rem;
          font-weight: 500;
          transition: all var(--transition-fast);
        }

        .sidebar-item:hover {
          background: var(--bg-tertiary);
          color: var(--text-primary);
        }

        .sidebar-item.active {
          background: rgba(123, 44, 191, 0.15);
          color: var(--accent-secondary);
          border: 1px solid rgba(123, 44, 191, 0.2);
        }

        .sidebar-item.active .sidebar-icon {
          color: var(--accent-primary);
        }

        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-label {
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 60px;
          }
          .sidebar-label {
            display: none;
          }
          .sidebar-item {
            justify-content: center;
            padding: 12px;
          }
        }
      `}</style>
    </aside>
  );
}
