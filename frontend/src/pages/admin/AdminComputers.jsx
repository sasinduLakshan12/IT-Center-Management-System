import React, { useEffect, useState } from 'react';
import { Monitor, Plus, Edit2, Trash2, Search, Wrench, Wifi, WifiOff, X, Check } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const statusColors = {
  Available: '#00e676',
  InUse: '#7b61ff',
  Maintenance: '#ff9800',
  Decommissioned: '#ff4b4b'
};

const AdminComputers = () => {
  const [computers, setComputers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editPC, setEditPC] = useState(null);
  const [form, setForm] = useState({ pcId: '', pcName: '', specs: 'Standard: i5, 8GB RAM', location: 'Row A', status: 'Available' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchComputers = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const { data } = await API.get('/computers', { params });
      setComputers(data.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchComputers(); }, [filter]);

  const openAdd = () => {
    setEditPC(null);
    setForm({ pcId: '', pcName: '', specs: 'Standard: i5, 8GB RAM', location: 'Row A', status: 'Available' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (pc) => {
    setEditPC(pc);
    setForm({ pcId: pc.pcId, pcName: pc.pcName, specs: pc.specs || 'Standard: i5, 8GB RAM', location: pc.location || 'Row A', status: pc.status });
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editPC) {
        await API.put(`/computers/${editPC._id}`, form);
      } else {
        await API.post('/computers', form);
      }
      setShowModal(false);
      fetchComputers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this computer? This action cannot be undone.')) return;
    try {
      await API.delete(`/computers/${id}`);
      fetchComputers();
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed.');
    }
  };

  const handleStatusToggle = async (pc, newStatus) => {
    try {
      await API.put(`/computers/${pc._id}/status`, { status: newStatus });
      fetchComputers();
    } catch (e) {
      alert('Failed to update status.');
    }
  };

  const filtered = computers.filter(c =>
    search ? (c.pcId?.toLowerCase().includes(search.toLowerCase()) || c.pcName?.toLowerCase().includes(search.toLowerCase()) || c.location?.toLowerCase().includes(search.toLowerCase())) : true
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Computer Management</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Manage workstations in the IT Center.</p>
        </div>
        <button className="glass-button" onClick={openAdd} id="add-computer-btn">
          <Plus size={18} /> Add Computer
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {Object.entries(statusColors).map(([status, color]) => (
          <div key={status} className="glass-panel" style={{ padding: '1rem 1.5rem', flex: '1', minWidth: '110px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: '700', color }}>{computers.filter(c => c.status === status).length}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{status}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input className="glass-input" placeholder="Search by PC ID, name, location..." style={{ paddingLeft: '38px' }} value={search} onChange={e => setSearch(e.target.value)} id="computers-search" />
        </div>
        {['all', 'Available', 'InUse', 'Maintenance', 'Decommissioned'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
            border: filter === f ? `1px solid ${statusColors[f] || 'var(--accent-color)'}` : '1px solid rgba(255,255,255,0.12)',
            background: filter === f ? `${statusColors[f] || 'var(--accent-color)'}22` : 'rgba(0,0,0,0.2)',
            color: filter === f ? (statusColors[f] || 'var(--accent-color)') : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Loading computers...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
          {filtered.map(pc => (
            <div key={pc._id} className="glass-panel" style={{ padding: '1.25rem', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '10px',
                  background: `${statusColors[pc.status]}18`, border: `1px solid ${statusColors[pc.status]}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: statusColors[pc.status]
                }}>
                  <Monitor size={20} />
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
                  background: `${statusColors[pc.status]}18`, color: statusColors[pc.status],
                  border: `1px solid ${statusColors[pc.status]}40`
                }}>
                  {pc.status}
                </span>
              </div>

              <p style={{ fontWeight: '700', fontSize: '1.05rem', marginBottom: '3px' }}>{pc.pcId}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '4px' }}>{pc.pcName}</p>
              {pc.location && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', marginBottom: '4px' }}>📍 {pc.location}</p>}
              {pc.specs && <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem' }}>🔧 {pc.specs}</p>}

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {pc.status === 'Available' && (
                  <button onClick={() => handleStatusToggle(pc, 'Maintenance')} title="Set to Maintenance"
                    style={{ flex: 1, padding: '7px', borderRadius: '8px', background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.3)', color: '#ff9800', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem' }}>
                    <Wrench size={14} /> Maintenance
                  </button>
                )}
                {pc.status === 'Maintenance' && (
                  <button onClick={() => handleStatusToggle(pc, 'Available')} title="Mark Available"
                    style={{ flex: 1, padding: '7px', borderRadius: '8px', background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.78rem' }}>
                    <Check size={14} /> Available
                  </button>
                )}
                <button onClick={() => openEdit(pc)} title="Edit"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(123,97,255,0.12)', border: '1px solid rgba(123,97,255,0.3)', color: '#7b61ff', cursor: 'pointer' }}>
                  <Edit2 size={15} />
                </button>
                <button onClick={() => handleDelete(pc._id)} title="Delete"
                  style={{ padding: '7px 12px', borderRadius: '8px', background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.3)', color: '#ff6b6b', cursor: 'pointer' }}>
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '460px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{editPC ? 'Edit Computer' : 'Add Computer'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={22} /></button>
            </div>

            {error && <div style={{ background: 'rgba(255,75,75,0.15)', border: '1px solid rgba(255,75,75,0.4)', borderRadius: '8px', padding: '10px 14px', marginBottom: '1.2rem', color: '#ff8080', fontSize: '0.9rem' }}>{error}</div>}

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>PC ID *</label>
                <input className="glass-input" placeholder="e.g. PC-01" value={form.pcId} onChange={e => setForm({ ...form, pcId: e.target.value })} required id="computer-pcId" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Display Name *</label>
                <input className="glass-input" placeholder="e.g. Lab Computer 01" value={form.pcName} onChange={e => setForm({ ...form, pcName: e.target.value })} required id="computer-name" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Specs</label>
                <select className="glass-input" value={form.specs} onChange={e => setForm({ ...form, specs: e.target.value })} id="computer-specs">
                  {['Standard: i5, 8GB RAM', 'High-End: i7, 16GB RAM', 'Design: i9, 32GB RAM, RTX 3060'].map(s => <option key={s} value={s} style={{ background: '#1a1a3a' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Location</label>
                <select className="glass-input" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} id="computer-location">
                  {['Row A', 'Row B', 'Row C', 'Row D', 'Row E', 'Row F', 'Row G', 'Row H'].map(s => <option key={s} value={s} style={{ background: '#1a1a3a' }}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Status</label>
                <select className="glass-input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} id="computer-status">
                  {['Available', 'Maintenance', 'Decommissioned'].map(s => <option key={s} value={s} style={{ background: '#1a1a3a' }}>{s}</option>)}
                </select>
              </div>
              <button type="submit" className="glass-button" disabled={saving} style={{ width: '100%', marginTop: '0.5rem' }}>
                {saving ? 'Saving...' : editPC ? 'Save Changes' : 'Add Computer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminComputers;
