import React, { useEffect, useState } from 'react';
import { Bell, CheckCheck, BellOff, Trash2 } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import API from '../utils/api';

const typeColors = {
  booking: '#7b61ff',
  system: '#00d2ff',
  announcement: '#00e676',
  violation: '#ff4b4b',
  issue: '#ff9800'
};

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.data || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) { console.error(e); }
  };

  const handleMarkAllRead = async () => {
    try {
      await API.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // prevent triggering handleMarkRead
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    try {
      await API.delete(`/notifications/${id}`);
      setNotifications(prev => {
        const deleted = prev.find(n => n._id === id);
        if (deleted && !deleted.isRead) {
            setUnreadCount(count => Math.max(0, count - 1));
        }
        return prev.filter(n => n._id !== id);
      });
    } catch (err) { console.error(err); }
  };

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '720px' }}>
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Notifications
              {unreadCount > 0 && (
                <span style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '700', background: 'rgba(123,97,255,0.25)', color: '#7b61ff', border: '1px solid rgba(123,97,255,0.4)' }}>
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Your system notifications and alerts.</p>
          </div>
          {unreadCount > 0 && (
            <button className="glass-button secondary" onClick={handleMarkAllRead} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem' }}>
              <CheckCheck size={16} /> Mark all as read
            </button>
          )}
        </div>

        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <BellOff size={48} style={{ margin: '0 auto 1rem', opacity: 0.25 }} />
              <p style={{ color: 'var(--text-secondary)' }}>You're all caught up!</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '0.4rem' }}>No new notifications.</p>
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={n._id} onClick={() => !n.isRead && handleMarkRead(n._id)} style={{
                display: 'flex', gap: '1rem', padding: '1.25rem 1.5rem',
                borderBottom: i < notifications.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: n.isRead ? 'transparent' : 'rgba(123,97,255,0.04)',
                cursor: n.isRead ? 'default' : 'pointer',
                transition: 'background 0.2s',
                alignItems: 'flex-start'
              }}
                onMouseEnter={e => !n.isRead && (e.currentTarget.style.background = 'rgba(123,97,255,0.08)')}
                onMouseLeave={e => !n.isRead && (e.currentTarget.style.background = 'rgba(123,97,255,0.04)')}
              >
                {/* Icon */}
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                  background: `${typeColors[n.type] || '#7b61ff'}18`,
                  border: `1px solid ${typeColors[n.type] || '#7b61ff'}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: typeColors[n.type] || '#7b61ff'
                }}>
                  <Bell size={18} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '4px' }}>
                    <p style={{ fontWeight: n.isRead ? '400' : '600', fontSize: '0.95rem' }}>{n.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', whiteSpace: 'nowrap', flexShrink: 0 }}>{timeAgo(n.createdAt)}</span>
                        <button 
                            onClick={(e) => handleDelete(e, n._id)}
                            style={{ 
                                background: 'transparent', border: 'none', color: 'var(--text-secondary)', 
                                cursor: 'pointer', display: 'flex', alignItems: 'center',
                                padding: '4px'
                            }}
                            title="Delete notification"
                            onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{n.message}</p>
                  <div style={{ marginTop: '6px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '2px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '500', background: `${typeColors[n.type] || '#7b61ff'}18`, color: typeColors[n.type] || '#7b61ff', border: `1px solid ${typeColors[n.type] || '#7b61ff'}30`, textTransform: 'capitalize' }}>{n.type}</span>
                    {!n.isRead && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7b61ff', flexShrink: 0 }} />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
