import React, { useEffect, useState } from 'react';
import { Monitor, Clock, Calendar, X, QrCode, Search, Filter, Trash2, Download } from 'lucide-react';
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
  const [selectedQR, setSelectedQR] = useState(null); // { qrCode: string, pcId: string, reference: string }

  const downloadQRCode = () => {
    if (!selectedQR) return;
    const link = document.createElement('a');
    link.href = selectedQR.qrCode;
    link.download = `IT_Center_QR_${selectedQR.reference}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      await API.put(`/bookings/${id}/cancel`, { reason: 'Cancelled by student' });
      fetchBookings();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not cancel booking.');
    } finally {
      setCancelling(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this booking record?')) return;
    setCancelling(id);
    try {
      await API.delete(`/bookings/${id}`);
      fetchBookings();
    } catch (e) {
      alert(e.response?.data?.message || 'Could not delete booking.');
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

                {/* Show QR Button */}
                {(b.status === 'Confirmed' || b.status === 'Active') && b.qrCode && (
                  <button
                    onClick={() => setSelectedQR({ qrCode: b.qrCode, pcId: b.assignedComputer?.pcId, reference: b.referenceNumber })}
                    title="View QR Code"
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      background: 'rgba(123, 97, 255, 0.15)', border: '1px solid rgba(123, 97, 255, 0.3)',
                      color: 'var(--accent-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(123, 97, 255, 0.25)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(123, 97, 255, 0.15)' }}
                  >
                    <QrCode size={16} />
                  </button>
                )}

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
                {['Cancelled', 'Completed', 'Missed', 'Rejected'].includes(b.status) && (
                  <button
                    onClick={() => handleDelete(b._id)}
                    disabled={cancelling === b._id}
                    title="Delete record"
                    style={{
                      width: '34px', height: '34px', borderRadius: '8px',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.borderColor = 'rgba(255,75,75,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  >
                    {cancelling === b._id ? '...' : <Trash2 size={16} />}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* QR Modal */}
      {selectedQR && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }} onClick={() => setSelectedQR(null)}>
          <div style={{
            background: 'var(--bg-card)', padding: '2.5rem', borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxWidth: '350px', width: '90%'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '0.2rem' }}>Scan to Enter</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Show this QR code at the IT Center</p>
            </div>
            
            <div style={{ background: '#fff', padding: '1rem', borderRadius: '12px' }}>
              <img src={selectedQR.qrCode} alt="Booking QR Code" style={{ width: '200px', height: '200px' }} />
            </div>

            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>PC {selectedQR.pcId}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '4px' }}>REF: {selectedQR.reference}</div>
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button 
                onClick={downloadQRCode}
                style={{ 
                  flex: 1, padding: '0.8rem', borderRadius: '10px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)',
                  cursor: 'pointer'
                }}
              >
                <Download size={18} /> Download
              </button>
              
              <button 
                onClick={() => setSelectedQR(null)}
                className="btn-primary" 
                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default MyBookings;
