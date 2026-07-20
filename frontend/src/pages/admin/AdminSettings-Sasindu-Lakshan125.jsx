import React, { useEffect, useState } from 'react';
import { Settings, Save, AlertCircle } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    universityName: '',
    itCenterName: '',
    dailyBookingLimit: 2,
    gracePeriod: 10,
    cancellationDeadline: 30,
    maxSessionDuration: 60
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await API.get('/settings');
        if (data.data) {
          setSettings(data.data);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load settings.' });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await API.put('/settings', settings);
      setMessage({ type: 'success', text: 'Settings updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update settings.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading settings...</div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>System Settings</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Configure global settings for the IT Center Management System.</p>
        </div>
      </div>

      {message.text && (
        <div style={{ 
          padding: '12px 16px', borderRadius: '10px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px',
          background: message.type === 'success' ? 'rgba(0,230,118,0.15)' : 'rgba(255,75,75,0.15)',
          color: message.type === 'success' ? '#00e676' : '#ff6b6b',
          border: `1px solid ${message.type === 'success' ? 'rgba(0,230,118,0.3)' : 'rgba(255,75,75,0.3)'}`
        }}>
          <AlertCircle size={18} />
          <span style={{ fontSize: '0.95rem', fontWeight: '500' }}>{message.text}</span>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Settings size={18} /> General Information
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>University Name</label>
                <input type="text" className="glass-input" name="universityName" value={settings.universityName || ''} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>IT Center Name</label>
                <input type="text" className="glass-input" name="itCenterName" value={settings.itCenterName || ''} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)' }} />

          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--accent-color)' }}>Booking Rules</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Daily Booking Limit (per student)</label>
                <input type="number" min="1" className="glass-input" name="dailyBookingLimit" value={settings.dailyBookingLimit || 2} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Max Session Duration (minutes)</label>
                <input type="number" min="15" step="15" className="glass-input" name="maxSessionDuration" value={settings.maxSessionDuration || 60} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Check-in Grace Period (minutes)</label>
                <input type="number" min="0" className="glass-input" name="gracePeriod" value={settings.gracePeriod || 10} onChange={handleChange} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Cancellation Deadline (minutes before)</label>
                <input type="number" min="0" className="glass-input" name="cancellationDeadline" value={settings.cancellationDeadline || 30} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <button type="submit" className="glass-button" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
              <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>

        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
