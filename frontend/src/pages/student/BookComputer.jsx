import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Monitor, CheckCircle, AlertCircle, Loader, Server } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const BookComputer = () => {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [purpose, setPurpose] = useState('');
  
  const [availabilityData, setAvailabilityData] = useState(null);
  const [selectedComputer, setSelectedComputer] = useState('');
  
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
      if (!selectedDate || !selectedSlot) { 
        setAvailabilityData(null); 
        setSelectedComputer('');
        return; 
      }
      setChecking(true);
      try {
        const { data } = await API.get(`/bookings/availability?date=${selectedDate}&timeSlotId=${selectedSlot}`);
        setAvailabilityData(data.data);
        setSelectedComputer(''); // reset on new slot
      } catch (e) {
        setAvailabilityData(null);
      } finally {
        setChecking(false);
      }
    };
    checkAvailability();
  }, [selectedDate, selectedSlot]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !purpose) return;
    
    // If computers are available, ensure one is selected
    if (availabilityData?.availableComputers > 0 && !selectedComputer) {
      setError('Please select an available computer from the lab layout.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);
    try {
      const payload = { 
        bookingDate: selectedDate, 
        timeSlotId: selectedSlot, 
        purpose,
        computerId: selectedComputer || undefined
      };
      
      const { data } = await API.post('/bookings', payload);
      setSuccess(data);
      setSelectedDate('');
      setSelectedSlot('');
      setPurpose('');
      setSelectedComputer('');
      setAvailabilityData(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Book a Computer</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
            Reserve a workstation for your study session. Select your preferred PC from the lab layout.
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
                    : `Your booking is confirmed! Reference: ${success.data?.referenceNumber}. You have reserved a computer for this session.`
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {/* Left Column: Form */}
          <div className="glass-panel" style={{ padding: '2rem', flex: '1 1 350px' }}>
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
                  style={{ colorScheme: 'dark', width: '100%' }}
                />
              </div>

              {/* Time Slot Selector */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.6rem', fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                  <Clock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  Select Time Slot
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
                  {timeSlots.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No time slots available.</p>
                  ) : (
                    timeSlots.map(slot => (
                      <button
                        key={slot._id}
                        type="button"
                        onClick={() => setSelectedSlot(slot._id)}
                        style={{
                          padding: '12px',
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
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{slot.startTime} – {slot.endTime}</p>
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

              {/* Error */}
              {error && (
                <div style={{
                  background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.4)',
                  borderRadius: '10px', padding: '12px 16px', fontSize: '0.9rem', color: '#ff8080'
                }}>{error}</div>
              )}

              <button
                type="submit"
                className="glass-button"
                id="booking-submit"
                disabled={loading || !selectedDate || !selectedSlot || !purpose || (availabilityData?.availableComputers > 0 && !selectedComputer)}
                style={{ 
                  padding: '14px', 
                  fontSize: '1rem', 
                  opacity: (loading || !selectedDate || !selectedSlot || !purpose || (availabilityData?.availableComputers > 0 && !selectedComputer)) ? 0.5 : 1 
                }}
              >
                {loading ? 'Processing...' : availabilityData?.availableComputers === 0 ? 'Join Waiting List' : 'Confirm Booking'}
              </button>
            </form>
          </div>

          {/* Right Column: Computer Selection Layout */}
          <div className="glass-panel" style={{ padding: '2rem', flex: '1 1 450px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Server size={18} color="var(--primary-color)" />
              Lab Layout Selection
            </h2>
            
            {!selectedDate || !selectedSlot ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center', opacity: 0.6 }}>
                <Monitor size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                <p>Select a date and time slot first<br/>to view available computers.</p>
              </div>
            ) : checking ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                <Loader size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: 'var(--primary-color)' }} />
                <p>Loading lab layout...</p>
              </div>
            ) : availabilityData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                
                {/* Status Bar */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#00e676' }}></div> Available ({availabilityData.availableComputers})
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff4b4b' }}></div> Booked
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#9e9e9e' }}></div> Maintenance
                    </div>
                  </div>
                  {availabilityData.waitingListSize > 0 && (
                    <div style={{ fontSize: '0.85rem', color: '#ff9800', fontWeight: '500' }}>
                      Waiting List: {availabilityData.waitingListSize}
                    </div>
                  )}
                </div>

                {/* Lab Grid */}
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }} className="custom-scrollbar">
                  {Object.keys(availabilityData.layout).length === 0 ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '2rem' }}>No computers found in the lab.</p>
                  ) : (
                    Object.entries(availabilityData.layout).map(([location, computers]) => (
                      <div key={location} style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {location}
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px' }}>
                          {computers.map(pc => {
                            const isAvailable = pc.status === 'Available';
                            const isSelected = selectedComputer === pc._id;
                            const isBooked = pc.status === 'Booked';
                            
                            let bgColor = 'rgba(255,255,255,0.05)';
                            let borderColor = 'rgba(255,255,255,0.1)';
                            let iconColor = 'var(--text-secondary)';

                            if (isSelected) {
                              bgColor = 'rgba(0, 230, 118, 0.2)';
                              borderColor = '#00e676';
                              iconColor = '#00e676';
                            } else if (isAvailable) {
                              bgColor = 'rgba(0, 230, 118, 0.05)';
                              borderColor = 'rgba(0, 230, 118, 0.3)';
                              iconColor = '#00e676';
                            } else if (isBooked) {
                              bgColor = 'rgba(255, 75, 75, 0.08)';
                              borderColor = 'rgba(255, 75, 75, 0.2)';
                              iconColor = '#ff4b4b';
                            } else {
                              // Maintenance
                              bgColor = 'rgba(158, 158, 158, 0.08)';
                              borderColor = 'rgba(158, 158, 158, 0.2)';
                              iconColor = '#9e9e9e';
                            }

                            return (
                              <div
                                key={pc._id}
                                onClick={() => isAvailable && setSelectedComputer(pc._id)}
                                style={{
                                  background: bgColor,
                                  border: `1px solid ${borderColor}`,
                                  borderRadius: '10px',
                                  padding: '12px 8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  gap: '8px',
                                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                                  opacity: (isBooked || !isAvailable) ? 0.6 : 1,
                                  transition: 'all 0.2s ease',
                                  boxShadow: isSelected ? '0 0 15px rgba(0,230,118,0.2)' : 'none',
                                  transform: isSelected ? 'scale(1.05)' : 'scale(1)'
                                }}
                                onMouseEnter={(e) => { if(isAvailable && !isSelected) e.currentTarget.style.borderColor = '#00e676'; }}
                                onMouseLeave={(e) => { if(isAvailable && !isSelected) e.currentTarget.style.borderColor = 'rgba(0, 230, 118, 0.3)'; }}
                              >
                                <Monitor size={24} color={iconColor} />
                                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: isAvailable ? '#fff' : 'var(--text-secondary)' }}>
                                  {pc.pcId}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <style>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default BookComputer;
