import React, { useEffect, useState } from 'react';
import { Calendar, Search, QrCode, X, Clock, Monitor, ChevronDown, CheckCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const statusColors = {
  Confirmed: '#7b61ff',
  Active: '#00e676',
  Completed: 'rgba(255,255,255,0.5)',
  Cancelled: '#ff4b4b',
  Missed: '#ff9800'
};

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [checkInModal, setCheckInModal] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [checkInError, setCheckInError] = useState('');

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (dateFilter) params.date = dateFilter;
      const { data } = await API.get('/bookings', { params });
      setBookings(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(); }, [statusFilter, dateFilter]);

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setCheckInLoading(true);
    setCheckInError('');
    setCheckInResult(null);
    try {
      const { data } = await API.post('/sessions/check-in', {
        referenceNumber: refInput,
        checkInMethod: 'Admin Manual'
      });
      setCheckInResult(data);
      fetchBookings();
    } catch (err) {
      setCheckInError(err.response?.data?.message || 'Check-in failed.');
    } finally {
      setCheckInLoading(false);
    }
  };

  const filtered = bookings.filter(b =>
    search ? (
      b.referenceNumber?.toLowerCase().includes(search.toLowerCase()) ||
      b.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      b.student?.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      b.assignedComputer?.pcId?.toLowerCase().includes(search.toLowerCase())
    ) : true
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>All Bookings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Manage reservations and perform student check-ins.</p>
        </div>
        <button className="glass-button" onClick={() => { setCheckInModal(true); setCheckInResult(null); setCheckInError(''); setRefInput(''); }} id="checkin-btn">
          <QrCode size={18} /> Check-In Student
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input className="glass-input" placeholder="Search by ref, student, PC..." style={{ paddingLeft: '38px' }} value={search} onChange={e => setSearch(e.target.value)} id="admin-bookings-search" />
        </div>
        <input type="date" className="glass-input" value={dateFilter} onChange={e => setDateFilter(e.target.value)} style={{ width: 'auto', colorScheme: 'dark' }} id="admin-bookings-date" />
        {['all', 'Confirmed', 'Active', 'Completed', 'Cancelled', 'Missed'].map(f => (
          <button key={f} onClick={() => setStatusFilter(f)} style={{
            padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
            border: statusFilter === f ? `1px solid ${statusColors[f] || 'var(--accent-color)'}` : '1px solid rgba(255,255,255,0.12)',
            background: statusFilter === f ? `${statusColors[f] || 'var(--accent-color)'}22` : 'rgba(0,0,0,0.2)',
            color: statusFilter === f ? (statusColors[f] || 'var(--accent-color)') : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr',
          padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <span>Student</span><span>Reference</span><span>Date</span><span>Slot</span><span>PC</span><span>Status</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading bookings...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Calendar size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-secondary)' }}>No bookings found.</p>
          </div>
        ) : filtered.map((b, i) => (
          <div key={b._id} style={{
            display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr',
            padding: '1rem 1.5rem', alignItems: 'center',
            borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            transition: 'background 0.2s'
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <div>
              <p style={{ fontWeight: '500', fontSize: '0.9rem' }}>{b.student?.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{b.student?.studentId}</p>
            </div>
            <span style={{ fontSize: '0.82rem', color: '#7b61ff', fontWeight: '600', fontFamily: 'monospace' }}>{b.referenceNumber}</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {new Date(b.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{b.timeSlot?.slotName || '—'}</span>
            <span style={{ fontSize: '0.85rem' }}>{b.assignedComputer?.pcId ? `PC ${b.assignedComputer.pcId}` : '—'}</span>
            <span style={{
              display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
              fontSize: '0.78rem', fontWeight: '600',
              background: `${statusColors[b.status] || 'rgba(255,255,255,0.1)'}18`,
              color: statusColors[b.status] || 'var(--text-secondary)',
              border: `1px solid ${statusColors[b.status] || 'rgba(255,255,255,0.1)'}40`
            }}>{b.status}</span>
          </div>
        ))}
      </div>

      {/* Check-In Modal */}
      {checkInModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(123,97,255,0.2)', border: '1px solid rgba(123,97,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7b61ff' }}>
                  <QrCode size={20} />
                </div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Student Check-In</h2>
              </div>
              <button onClick={() => setCheckInModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            {checkInResult ? (
              <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                <CheckCircle size={56} color="#00e676" style={{ margin: '0 auto 1rem' }} />
                <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Check-In Successful!</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Session has started. The computer status has been updated.</p>
                <button className="glass-button" onClick={() => setCheckInModal(false)} style={{ width: '100%', marginTop: '1.5rem' }}>Done</button>
              </div>
            ) : (
              <form onSubmit={handleCheckIn} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter the student's booking reference number to check them in and start their session.</p>
                {checkInError && <div style={{ background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.4)', borderRadius: '8px', padding: '10px 14px', color: '#ff8080', fontSize: '0.9rem' }}>{checkInError}</div>}
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Booking Reference</label>
                  <input className="glass-input" placeholder="e.g. BK-XXXXXX" value={refInput} onChange={e => setRefInput(e.target.value.toUpperCase())} required id="checkin-ref" style={{ fontFamily: 'monospace', fontSize: '1rem', letterSpacing: '0.05em' }} />
                </div>
                <button type="submit" className="glass-button" disabled={checkInLoading} style={{ width: '100%' }}>
                  {checkInLoading ? 'Processing...' : <><CheckCircle size={18} /> Confirm Check-In</>}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminBookings;
