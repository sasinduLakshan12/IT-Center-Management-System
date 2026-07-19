import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Monitor, LayoutDashboard, Calendar, Clock, ListOrdered,
  Bell, LogOut, ChevronLeft, ChevronRight, Users,
  Settings, BarChart2, Computer, ClipboardList, QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const studentLinks = [
    { to: '/student/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/student/book', icon: <Calendar size={20} />, label: 'Book a Computer' },
    { to: '/student/my-bookings', icon: <ClipboardList size={20} />, label: 'My Bookings' },
    { to: '/student/waiting-list', icon: <ListOrdered size={20} />, label: 'Waiting List' },
    { to: '/student/notifications', icon: <Bell size={20} />, label: 'Notifications' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/scanner', icon: <QrCode size={20} />, label: 'QR Scanner' },
    { to: '/admin/computers', icon: <Monitor size={20} />, label: 'Computers' },
    { to: '/admin/bookings', icon: <Calendar size={20} />, label: 'All Bookings' },
    { to: '/admin/time-slots', icon: <Clock size={20} />, label: 'Time Slots' },
    { to: '/admin/students', icon: <Users size={20} />, label: 'Students' },
    { to: '/admin/reports', icon: <BarChart2 size={20} />, label: 'Reports' },
    { to: '/admin/audit-logs', icon: <ClipboardList size={20} />, label: 'Audit Logs' },
    { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  const links = user?.role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{
      width: collapsed ? '72px' : '240px',
      minHeight: '100vh',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.3s ease',
      position: 'fixed',
      top: 0, left: 0,
      zIndex: 100,
      overflowX: 'hidden'
    }}>
      {/* Logo */}
      <div style={{ padding: '1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          minWidth: '40px', height: '40px',
          background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
          borderRadius: '12px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(123,97,255,0.4)'
        }}>
          <Monitor size={22} color="#fff" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: '700', lineHeight: 1.2 }}>IT Center</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Management System</div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav style={{ flex: 1, padding: '1rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 12px', borderRadius: '10px',
                background: active ? 'rgba(123, 97, 255, 0.25)' : 'transparent',
                border: active ? '1px solid rgba(123, 97, 255, 0.4)' : '1px solid transparent',
                color: active ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden'
              }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.07)')}
                onMouseLeave={e => !active && (e.currentTarget.style.background = 'transparent')}
              >
                <span style={{ minWidth: '20px', color: active ? 'var(--accent-color)' : 'inherit' }}>{link.icon}</span>
                {!collapsed && <span style={{ fontSize: '0.9rem', fontWeight: active ? '600' : '400' }}>{link.label}</span>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Logout */}
      <div style={{ padding: '1rem 0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!collapsed && (
          <div style={{ padding: '10px 12px', marginBottom: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role}</div>
          </div>
        )}
        <button onClick={handleLogout} style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          width: '100%', padding: '10px 12px', borderRadius: '10px',
          background: 'none', border: '1px solid transparent',
          color: '#ff6b6b', cursor: 'pointer', fontSize: '0.9rem',
          transition: 'all 0.2s ease'
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,107,107,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <LogOut size={20} />
          {!collapsed && 'Logout'}
        </button>

        {/* Collapse button */}
        <button onClick={() => setCollapsed(!collapsed)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '100%', padding: '10px', marginTop: '4px',
          borderRadius: '10px', background: 'none', border: '1px solid rgba(255,255,255,0.08)',
          color: 'var(--text-secondary)', cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
