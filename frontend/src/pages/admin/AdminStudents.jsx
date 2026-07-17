import React, { useEffect, useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Eye, ChevronDown, BadgeCheck } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const statusColors = {
  Approved: '#00e676',
  Pending: '#ff9800',
  Rejected: '#ff4b4b',
  Suspended: '#ff4b4b'
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.status = filter;
      const { data } = await API.get('/admin/students', { params });
      setStudents(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, [filter]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await API.put(`/admin/students/${id}/status`, { status: action });
      fetchStudents();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = students.filter(s =>
    search ? (s.name?.toLowerCase().includes(search.toLowerCase()) || s.studentId?.toLowerCase().includes(search.toLowerCase()) || s.email?.toLowerCase().includes(search.toLowerCase())) : true
  );

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Student Management</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Approve, reject or suspend student accounts.</p>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: students.length, color: '#7b61ff' },
          { label: 'Pending', value: students.filter(s => s.status === 'Pending').length, color: '#ff9800' },
          { label: 'Approved', value: students.filter(s => s.status === 'Approved').length, color: '#00e676' },
          { label: 'Rejected', value: students.filter(s => s.status === 'Rejected').length, color: '#ff4b4b' },
        ].map(s => (
          <div key={s.label} className="glass-panel" style={{ padding: '1rem 1.5rem', flex: '1', minWidth: '120px', textAlign: 'center' }}>
            <p style={{ fontSize: '1.6rem', fontWeight: '700', color: s.color }}>{s.value}</p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input className="glass-input" placeholder="Search by name, ID or email..." style={{ paddingLeft: '38px' }} value={search} onChange={e => setSearch(e.target.value)} id="students-search" />
        </div>
        {['all', 'Pending', 'Approved', 'Rejected', 'Suspended'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
            border: filter === f ? `1px solid ${statusColors[f] || 'var(--accent-color)'}` : '1px solid rgba(255,255,255,0.12)',
            background: filter === f ? `${statusColors[f] || 'var(--accent-color)'}22` : 'rgba(0,0,0,0.2)',
            color: filter === f ? (statusColors[f] || 'var(--accent-color)') : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}>{f === 'all' ? 'All' : f}</button>
        ))}
      </div>

      {/* Table */}
      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr 1fr 1fr',
          padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em'
        }}>
          <span>Student</span><span>Student ID</span><span>Email</span><span>Status</span><span>Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading students...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <Users size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ color: 'var(--text-secondary)' }}>No students found.</p>
          </div>
        ) : (
          filtered.map((s, i) => (
            <div key={s._id} style={{
              display: 'grid', gridTemplateColumns: '1.5fr 1fr 2fr 1fr 1fr',
              padding: '1rem 1.5rem', alignItems: 'center',
              borderBottom: i < filtered.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              transition: 'background 0.2s'
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: '700', flexShrink: 0
                }}>
                  {s.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontWeight: '500', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</span>
              </div>

              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.studentId}</span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.email}</span>

              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.78rem', fontWeight: '600',
                background: `${statusColors[s.status] || 'rgba(255,255,255,0.1)'}18`,
                color: statusColors[s.status] || 'var(--text-secondary)',
                border: `1px solid ${statusColors[s.status] || 'rgba(255,255,255,0.1)'}40`
              }}>{s.status}</span>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {s.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleAction(s._id, 'Approved')}
                      disabled={!!actionLoading}
                      title="Approve"
                      style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676', cursor: 'pointer' }}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(s._id, 'Rejected')}
                      disabled={!!actionLoading}
                      title="Reject"
                      style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,75,75,0.12)', border: '1px solid rgba(255,75,75,0.3)', color: '#ff6b6b', cursor: 'pointer' }}
                    >
                      <XCircle size={16} />
                    </button>
                  </>
                )}
                {s.status === 'Approved' && (
                  <button
                    onClick={() => handleAction(s._id, 'Suspended')}
                    disabled={!!actionLoading}
                    title="Suspend"
                    style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.3)', color: '#ff9800', cursor: 'pointer' }}
                  >
                    <Clock size={16} />
                  </button>
                )}
                {(s.status === 'Rejected' || s.status === 'Suspended') && (
                  <button
                    onClick={() => handleAction(s._id, 'Approved')}
                    disabled={!!actionLoading}
                    title="Re-approve"
                    style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676', cursor: 'pointer' }}
                  >
                    <BadgeCheck size={16} />
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

export default AdminStudents;
