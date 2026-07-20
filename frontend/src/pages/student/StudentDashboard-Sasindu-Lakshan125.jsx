import React, { useEffect, useState } from 'react';
import { Calendar, Clock, ListOrdered, Monitor, Plus, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const StatCard = ({ icon, label, value, color, sublabel }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: '700' }}>{value ?? '—'}</p>
        {sublabel && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{sublabel}</p>}
      </div>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: color
      }}>{icon}</div>
    </div>
  </div>
);

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get('/bookings/my-bookings');
        setBookings(data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const activeBooking = bookings.find(b => b.status === 'Active');
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');
  const completedBookings = bookings.filter(b => b.status === 'Completed');

  const statusColors = {
    Confirmed: '#7b61ff',
    Active: '#00e676',
    Completed: 'rgba(255,255,255,0.4)',
    Cancelled: '#ff4b4b',
    Missed: '#ff9800'
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>
          Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Here's your IT Center summary for today.</p>
      </div>

      {/* Active Session Banner */}
      {activeBooking && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,230,118,0.15), rgba(0,230,118,0.05))',
          border: '1px solid rgba(0,230,118,0.3)',
          borderRadius: '16px', padding: '1.25rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00e676', boxShadow: '0 0 10px #00e676' }} />
            <div>
              <p style={{ fontWeight: '600' }}>Session Active — PC {activeBooking.assignedComputer?.pcId}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {activeBooking.timeSlot?.slotName} · {activeBooking.referenceNumber}
              </p>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: '#00e676', fontWeight: '500' }}>LIVE</div>
        </div>
      )}

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <StatCard icon={<Calendar size={22} />} label="Upcoming Bookings" value={confirmedBookings.length} color="#7b61ff" sublabel="Confirmed" />
        <StatCard icon={<Monitor size={22} />} label="Sessions Completed" value={completedBookings.length} color="#00d2ff" sublabel="All time" />
        <StatCard icon={<ListOrdered size={22} />} label="Total Bookings" value={bookings.length} color="#00e676" sublabel="All time" />
      </div>

      {/* Quick Action */}
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/student/book" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: 'linear-gradient(135deg, rgba(123,97,255,0.2), rgba(0,210,255,0.1))',
            border: '1px solid rgba(123,97,255,0.3)',
            borderRadius: '16px', padding: '1.25rem 1.5rem',
            cursor: 'pointer', transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Plus size={24} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: '600', marginBottom: '0.2rem' }}>Book a Computer</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Reserve your workstation for a time slot</p>
            </div>
            <ChevronRight size={20} color="var(--text-secondary)" />
          </div>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Recent Bookings</h2>
          <Link to="/student/my-bookings" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '0.9rem' }}>
            View all →
          </Link>
        </div>
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
          ) : bookings.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
              <p>No bookings yet.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Make your first booking above!</p>
            </div>
          ) : (
            bookings.slice(0, 5).map((b, i) => (
              <div key={b._id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '1rem 1.5rem',
                borderBottom: i < bookings.slice(0, 5).length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: `${statusColors[b.status]}22`, border: `1px solid ${statusColors[b.status]}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColors[b.status]
                }}>
                  <Monitor size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', fontSize: '0.95rem' }}>
                    {b.assignedComputer?.pcId ? `PC ${b.assignedComputer.pcId}` : 'Unassigned'}
                    {' · '}{b.timeSlot?.slotName || '—'}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(b.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{b.referenceNumber}
                  </p>
                </div>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.78rem', fontWeight: '500',
                  background: `${statusColors[b.status]}22`, color: statusColors[b.status],
                  border: `1px solid ${statusColors[b.status]}44`
                }}>
                  {b.status}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
