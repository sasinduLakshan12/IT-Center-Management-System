import React, { useEffect, useState } from 'react';
import { Monitor, Clock, Calendar, X, QrCode, Search, Filter } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const statusColors = {
  Confirmed: '#7b61ff',
  Active: '#00e676',
  Completed: 'rgba(255,255,255,0.5)',
  Cancelled: '#ff4b4b',
  Missed: '#ff9800'
};

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [cancelling, setCancelling] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/bookings/my-bookings');
      setBookings(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(id);
    try {
      await API.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = bookings
    .filter(b => filter === 'all' ? true : b.status === filter)
    .filter(b => search ? (b.referenceNumber?.toLowerCase().includes(search.toLowerCase()) || b.assignedComputer?.pcId?.toLowerCase().includes(search.toLowerCase())) : true);

  const statusFilters = ['all', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Missed'];

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>My Bookings</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>View and manage your computer reservations.</p>
      </div>

      {/* Filter Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', marginBottom: '1.5rem' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            className="glass-input"
            placeholder="Search by reference or PC..."
            style={{ paddingLeft: '38px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="bookings-search"
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {statusFilters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
              border: filter === f ? `1px solid ${statusColors[f] || 'var(--accent-color)'}` : '1px solid rgba(255,255,255,0.12)',
              background: filter === f ? `${statusColors[f] || 'var(--accent-color)'}22` : 'rgba(0,0,0,0.2)',
              color: filter === f ? (statusColors[f] || 'var(--accent-color)') : 'var(--text-secondary)',
              transition: 'all 0.2s'
            }}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Booking List */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-secondary)' }}>No bookings found.</p>
          </div>
        ) : (
          filtered.map((b, i) => (
            <div key={b._id} style={{
              display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center',
              padding: '1.25rem 1.5rem',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* PC Icon */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                background: `${statusColors[b.status]}18`, border: `1px solid ${statusColors[b.status]}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColors[b.status]
              }}>
                <Monitor size={20} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: '160px' }}>
                <p style={{ fontWeight: '600', marginBottom: '3px' }}>
                  {b.assignedComputer?.pcId ? `PC ${b.assignedComputer.pcId}` : 'Unassigned'}
                  {' '}
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '400', fontSize: '0.85rem' }}>
                    — {b.timeSlot?.slotName}
                  </span>
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  <Calendar size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {new Date(b.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {'  ·  '}
                  <Clock size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                  {b.timeSlot?.startTime} – {b.timeSlot?.endTime}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.3)', marginTop: '2px' }}>
                  Ref: {b.referenceNumber}
                </p>
              </div>

              {/* Right Side */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600',
                  background: `${statusColors[b.status]}18`, color: statusColors[b.status],
                  border: `1px solid ${statusColors[b.status]}40`
                }}>
                  {b.status}
                </span>
                {(b.status === 'Confirmed') && (
                  <button
                    onClick={() => handleCancel(b._id)}
                    disabled={cancelling === b._id}
                    title="Cancel booking"
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      background: 'rgba(255,75,75,0.1)', border: '1px solid rgba(255,75,75,0.3)',
                      color: '#ff6b6b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    {cancelling === b._id ? '...' : <X size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyBookings;
