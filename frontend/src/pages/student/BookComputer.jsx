import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Monitor, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const BookComputer = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [purpose, setPurpose] = useState('');
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  // Get today's date as min value
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const { data } = await API.get('/time-slots');
        setTimeSlots(data.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSlots();
  }, []);

  // Check availability when date and slot are selected
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedDate || !selectedSlot) { setAvailability(null); return; }
      setChecking(true);
      try {
        const { data } = await API.get(`/bookings/availability?date=${selectedDate}&timeSlotId=${selectedSlot}`);
        setAvailability(data);
      } catch (e) {
        setAvailability(null);
      } finally {
        setChecking(false);
      }
    };
    checkAvailability();
  }, [selectedDate, selectedSlot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !purpose) return;
    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const { data } = await API.post('/bookings', { bookingDate: selectedDate, timeSlotId: selectedSlot, purpose });
      setSuccess(data);
      setSelectedDate('');
      setSelectedSlot('');
      setPurpose('');
      setAvailability(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSlotData = timeSlots.find(s => s._id === selectedSlot);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '640px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Book a Computer</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Reserve a workstation for your study session.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{
            background: success.data?.status === 'Waiting' ? 'rgba(255,152,0,0.12)' : 'rgba(0,230,118,0.12)',
            border: `1px solid ${success.data?.status === 'Waiting' ? 'rgba(255,152,0,0.4)' : 'rgba(0,230,118,0.4)'}`,
            borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <CheckCircle size={24} color={success.data?.status === 'Waiting' ? '#ff9800' : '#00e676'} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.4rem' }}>
                  {success.data?.status === 'Waiting' ? 'Added to Waiting List!' : 'Booking Confirmed!'}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {success.data?.status === 'Waiting'
                    ? `No computers were available. You've been placed in the waiting list at position ${success.data?.position}. We'll notify you if a slot opens up.`
                    : `Your booking is confirmed! Reference: ${success.data?.referenceNumber}. PC ${success.data?.assignedComputer?.pcId} is reserved for you.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="glass-panel" style={{ padding: '2rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Date Picker */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                <Calendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Select Date
              </label>
              <input
                type="date"
                className="glass-input"
                value={selectedDate}
                min={today}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                id="booking-date"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            {/* Time Slot Selector */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Select Time Slot
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {timeSlots.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No time slots available.</p>
                ) : (
                  timeSlots.map(slot => (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => setSelectedSlot(slot._id)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        border: selectedSlot === slot._id ? '1px solid rgba(123,97,255,0.8)' : '1px solid rgba(255,255,255,0.12)',
                        background: selectedSlot === slot._id ? 'rgba(123,97,255,0.2)' : 'rgba(0,0,0,0.2)',
                        color: '#fff',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.2s',
                        boxShadow: selectedSlot === slot._id ? '0 0 12px rgba(123,97,255,0.3)' : 'none'
                      }}
                    >
                      <p style={{ fontWeight: '600', fontSize: '0.85rem', marginBottom: '3px' }}>{slot.slotName}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{slot.startTime} – {slot.endTime}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Purpose Input */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                <AlertCircle size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                Purpose of Booking
              </label>
              <select
                className="glass-input"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                required
                style={{ width: '100%' }}
              >
                <option value="" disabled>Select a purpose...</option>
                <option value="Assignment work">Assignment work</option>
                <option value="Programming practice">Programming practice</option>
                <option value="Research">Research</option>
                <option value="Project work">Project work</option>
                <option value="Online examination">Online examination</option>
                <option value="Internet access">Internet access</option>
                <option value="Learning activities">Learning activities</option>
                <option value="Document preparation">Document preparation</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Availability Check */}
            {checking && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Checking availability...
              </div>
            )}
            {!checking && availability && (
              <div style={{
                padding: '1rem 1.25rem', borderRadius: '12px',
                background: availability.availableComputers > 0 ? 'rgba(0,230,118,0.08)' : 'rgba(255,152,0,0.08)',
                border: `1px solid ${availability.availableComputers > 0 ? 'rgba(0,230,118,0.3)' : 'rgba(255,152,0,0.3)'}`,
                display: 'flex', alignItems: 'center', gap: '12px'
              }}>
                {availability.availableComputers > 0
                  ? <Monitor size={20} color="#00e676" />
                  : <AlertCircle size={20} color="#ff9800" />
                }
                <div>
                  <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                    {availability.availableComputers > 0
                      ? `${availability.availableComputers} computer(s) available`
                      : 'No computers available'}
                  </p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    {availability.availableComputers > 0
                      ? 'You will be assigned a computer upon booking.'
                      : `${availability.waitingListSize ?? 0} people in queue. You'll be added to the waiting list.`}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.4)',
                borderRadius: '10px', padding: '12px 16px', fontSize: '0.9rem', color: '#ff8080'
              }}>{error}</div>
            )}

            {/* Summary */}
            {selectedDate && selectedSlotData && (
              <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Booking Summary</p>
                <p style={{ fontWeight: '600' }}>
                  {new Date(selectedDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {selectedSlotData.slotName} · {selectedSlotData.startTime} – {selectedSlotData.endTime}
                </p>
              </div>
            )}

            <button
              type="submit"
              className="glass-button"
              id="booking-submit"
              disabled={loading || !selectedDate || !selectedSlot || !purpose}
              style={{ padding: '14px', fontSize: '1rem', opacity: (loading || !selectedDate || !selectedSlot || !purpose) ? 0.5 : 1 }}
            >
              {loading ? 'Processing...' : availability?.availableComputers === 0 ? 'Join Waiting List' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </DashboardLayout>
  );
};

export default BookComputer;
