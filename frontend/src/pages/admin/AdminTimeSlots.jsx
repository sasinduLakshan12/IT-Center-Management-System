import React, { useEffect, useState } from 'react';
import { Clock, Plus, Edit2, Trash2, X } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AdminTimeSlots = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editSlot, setEditSlot] = useState(null);
  const [form, setForm] = useState({ slotName: '', startTime: '', endTime: '', maxBookings: 20, isActive: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/time-slots');
      setSlots(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSlots(); }, []);

  const openAdd = () => {
    setEditSlot(null);
    setForm({ slotName: '', startTime: '', endTime: '', maxBookings: 20, isActive: true });
    setError('');
    setShowModal(true);
  };

  const openEdit = (slot) => {
    setEditSlot(slot);
    setForm({ slotName: slot.slotName, startTime: slot.startTime, endTime: slot.endTime, maxBookings: slot.maxBookings || 20, isActive: slot.isActive !== false });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editSlot) await API.put(`/time-slots/${editSlot._id}`, form);
      else await API.post('/time-slots', form);
      setShowModal(false);
      fetchSlots();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save slot.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this time slot?')) return;
    try {
      await API.delete(`/time-slots/${id}`);
      fetchSlots();
    } catch (e) { alert(e.response?.data?.message || 'Delete failed.'); }
  };

  const dayColors = ['#7b61ff', '#00d2ff', '#00e676', '#ff9800', '#ff6b6b', '#a78bfa', '#34d399'];

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Time Slots</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Configure available booking time slots for the IT Center.</p>
        </div>
        <button className="glass-button" onClick={openAdd} id="add-slot-btn">
          <Plus size={18} /> Add Time Slot
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : slots.length === 0 ? (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
          <p style={{ color: 'var(--text-secondary)' }}>No time slots configured yet.</p>
          <button className="glass-button" onClick={openAdd} style={{ marginTop: '1rem' }}><Plus size={16} /> Add First Slot</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {slots.map((slot, idx) => (
            <div key={slot._id} className="glass-panel" style={{ padding: '1.5rem', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Color Accent Bar */}
              <div style={{ height: '3px', borderRadius: '3px', background: dayColors[idx % dayColors.length], marginBottom: '1.2rem' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontWeight: '700', fontSize: '1.1rem', marginBottom: '3px' }}>{slot.slotName}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={14} color={dayColors[idx % dayColors.length]} />
                    <span style={{ fontSize: '0.9rem', color: dayColors[idx % dayColors.length], fontWeight: '600' }}>
                      {slot.startTime} – {slot.endTime}
                    </span>
                  </div>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                  background: slot.isActive !== false ? 'rgba(0,230,118,0.15)' : 'rgba(255,75,75,0.15)',
                  color: slot.isActive !== false ? '#00e676' : '#ff6b6b',
                  border: `1px solid ${slot.isActive !== false ? 'rgba(0,230,118,0.4)' : 'rgba(255,75,75,0.4)'}`
                }}>
                  {slot.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ padding: '10px 12px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '700', color: dayColors[idx % dayColors.length] }}>{slot.maxBookings || 20}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Max Bookings</p>
                </div>
                <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }} />
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                    {(() => {
                      const [sh, sm] = slot.startTime.split(':').map(Number);
                      const [eh, em] = slot.endTime.split(':').map(Number);
                      const mins = (eh * 60 + em) - (sh * 60 + sm);
                      return mins >= 60 ? `${Math.floor(mins / 60)}h${mins % 60 > 0 ? ` ${mins % 60}m` : ''}` : `${mins}m`;
                    })()}
                  </p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Duration</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => openEdit(slot)} style={{
                  flex: 1, padding: '8px', borderRadius: '8px',
                  background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)',
                  color: '#7b61ff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: '500'
                }}><Edit2 size={14} /> Edit</button>
                <button onClick={() => handleDelete(slot._id)} style={{
                  padding: '8px 12px', borderRadius: '8px',
                  background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.3)',
                  color: '#ff6b6b', cursor: 'pointer'
                }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '440px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{editSlot ? 'Edit Time Slot' : 'Add Time Slot'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>
            {error && <div style={{ background: 'rgba(255,75,75,0.15)', border: '1px solid rgba(255,75,75,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.2rem', color: '#ff8080', fontSize: '0.9rem' }}>{error}</div>}
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Slot Name *</label>
                <input className="glass-input" placeholder="e.g. Morning Session" value={form.slotName} onChange={e => setForm({ ...form, slotName: e.target.value })} required id="slot-name" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Start Time *</label>
                  <input type="time" className="glass-input" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required id="slot-start" style={{ colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>End Time *</label>
                  <input type="time" className="glass-input" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required id="slot-end" style={{ colorScheme: 'dark' }} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Max Bookings</label>
                <input type="number" min="1" className="glass-input" value={form.maxBookings} onChange={e => setForm({ ...form, maxBookings: parseInt(e.target.value) })} id="slot-max" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active</label>
                <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} style={{
                  width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: form.isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.15)',
                  position: 'relative', transition: 'background 0.3s'
                }}>
                  <div style={{
                    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: '3px', left: form.isActive ? '23px' : '3px',
                    transition: 'left 0.3s'
                  }} />
                </button>
              </div>
              <button type="submit" className="glass-button" disabled={saving} style={{ width: '100%', marginTop: '0.5rem' }}>
                {saving ? 'Saving...' : editSlot ? 'Save Changes' : 'Add Slot'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminTimeSlots;
