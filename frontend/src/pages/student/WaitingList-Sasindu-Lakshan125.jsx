import React, { useEffect, useState } from 'react';
import { ListOrdered, Clock } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const WaitingListPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get('/waiting-list/my-status');
        setList(data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const statusColors = { Waiting: '#ff9800', Assigned: '#00e676', Expired: '#ff4b4b', Notified: '#7b61ff' };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '720px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Waiting List</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Your position in the queue for computer sessions.
          </p>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : list.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center' }}>
            <ListOrdered size={48} style={{ margin: '0 auto 1rem', opacity: 0.25 }} />
            <p style={{ color: 'var(--text-secondary)' }}>You're not on any waiting list.</p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', marginTop: '0.4rem' }}>When a time slot is full, your queue position will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {list.map((entry, i) => (
              <div key={entry._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                {/* Position Badge */}
                <div style={{
                  width: '56px', height: '56px', borderRadius: '14px', flexShrink: 0,
                  background: entry.status === 'Waiting' ? 'rgba(255,152,0,0.15)' : 'rgba(0,230,118,0.15)',
                  border: `1px solid ${entry.status === 'Waiting' ? 'rgba(255,152,0,0.4)' : 'rgba(0,230,118,0.4)'}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  color: entry.status === 'Waiting' ? '#ff9800' : '#00e676'
                }}>
                  <span style={{ fontSize: '1.3rem', fontWeight: '800' }}>{entry.currentPosition ?? '—'}</span>
                  <span style={{ fontSize: '0.6rem', opacity: 0.8 }}>QUEUE</span>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {entry.timeSlot?.slotName}
                    {' '}
                    <span style={{ fontWeight: '400', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {entry.timeSlot?.startTime} – {entry.timeSlot?.endTime}
                    </span>
                  </p>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={13} />
                    {new Date(entry.bookingDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  {entry.status === 'Waiting' && (
                    <p style={{ fontSize: '0.8rem', color: '#ff9800', marginTop: '6px' }}>
                      ⏳ You are number <strong>{entry.currentPosition}</strong> in the queue. We'll notify you by email if a spot opens.
                    </p>
                  )}
                  {entry.status === 'Assigned' && (
                    <p style={{ fontSize: '0.8rem', color: '#00e676', marginTop: '6px' }}>
                      ✅ A computer has been assigned! Check your bookings.
                    </p>
                  )}
                </div>

                {/* Status */}
                <span style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', flexShrink: 0,
                  background: `${statusColors[entry.status] || '#7b61ff'}18`,
                  color: statusColors[entry.status] || '#7b61ff',
                  border: `1px solid ${statusColors[entry.status] || '#7b61ff'}40`
                }}>{entry.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default WaitingListPage;
