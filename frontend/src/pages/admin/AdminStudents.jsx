import React, { useEffect, useState } from 'react';
import { Users, Search, CheckCircle, XCircle, Clock, Eye, ChevronDown, BadgeCheck } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const statusColors = {
  Approved: '#00e676',
  'Pending Approval': '#ff9800',
  Rejected: '#ff4b4b',
  Suspended: '#ff4b4b'
};

const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectionModal, setRejectionModal] = useState({ open: false, studentId: null, reason: '' });
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await API.get('/admin/students');
      setStudents(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleAction = async (id, action, currentStatus) => {
    setActionLoading(id + action);
    try {
      if (action === 'Approved') {
        if (currentStatus === 'Suspended') {
          await API.put(`/admin/students/${id}/suspend`);
        } else {
          await API.put(`/admin/approve-student/${id}`);
        }
      } else if (action === 'Rejected') {
        setRejectionModal({ open: true, studentId: id, reason: '' });
        return; // Modal handles submission
      } else if (action === 'Suspended') {
        await API.put(`/admin/students/${id}/suspend`);
      }
      fetchStudents();
    } catch (e) {
      alert(e.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const submitRejection = async () => {
    if (!rejectionModal.reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }
    setActionLoading(rejectionModal.studentId + 'Rejected');
    try {
      await API.put(`/admin/reject-student/${rejectionModal.studentId}`, { reason: rejectionModal.reason });
      setRejectionModal({ open: false, studentId: null, reason: '' });
      fetchStudents();
    } catch (e) {
      alert(e.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = students.filter(s => {
    const matchesSearch = search 
      ? (s.name?.toLowerCase().includes(search.toLowerCase()) || 
         s.studentId?.toLowerCase().includes(search.toLowerCase()) || 
         s.email?.toLowerCase().includes(search.toLowerCase())) 
      : true;
    
    const matchesFilter = filter === 'all' ? true : s.status === filter;
    
    return matchesSearch && matchesFilter;
  });

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
          { label: 'Pending', value: students.filter(s => s.status === 'Pending Approval').length, color: '#ff9800' },
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
        {['all', 'Pending Approval', 'Approved', 'Rejected', 'Suspended'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: '500',
            border: filter === f ? `1px solid ${statusColors[f] || 'var(--accent-color)'}` : '1px solid rgba(255,255,255,0.12)',
            background: filter === f ? `${statusColors[f] || 'var(--accent-color)'}22` : 'rgba(0,0,0,0.2)',
            color: filter === f ? (statusColors[f] || 'var(--accent-color)') : 'var(--text-secondary)',
            transition: 'all 0.2s'
          }}>{f === 'all' ? 'All' : f === 'Pending Approval' ? 'Pending' : f}</button>
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
                <button
                  onClick={() => setSelectedStudent(s)}
                  disabled={!!actionLoading}
                  title="View Details"
                  style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <Eye size={16} />
                </button>
                {s.status === 'Pending Approval' && (
                  <>
                    <button
                      onClick={() => handleAction(s._id, 'Approved', s.status)}
                      disabled={!!actionLoading}
                      title="Approve"
                      style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676', cursor: 'pointer' }}
                    >
                      <CheckCircle size={16} />
                    </button>
                    <button
                      onClick={() => handleAction(s._id, 'Rejected', s.status)}
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
                    onClick={() => handleAction(s._id, 'Suspended', s.status)}
                    disabled={!!actionLoading}
                    title="Suspend"
                    style={{ padding: '6px', borderRadius: '8px', background: 'rgba(255,152,0,0.12)', border: '1px solid rgba(255,152,0,0.3)', color: '#ff9800', cursor: 'pointer' }}
                  >
                    <Clock size={16} />
                  </button>
                )}
                {(s.status === 'Rejected' || s.status === 'Suspended') && (
                  <button
                    onClick={() => handleAction(s._id, 'Approved', s.status)}
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
      {/* Custom Rejection Modal */}
      {rejectionModal.open && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '450px', padding: '2rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ff4b4b', marginBottom: '0.5rem' }}>Reject Registration</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Please provide a clear reason for rejecting this student's registration request.</p>
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>REJECTION REASON</label>
              <textarea
                className="glass-input"
                rows={4}
                placeholder="e.g. Invalid ID card photo / Information mismatch..."
                style={{ resize: 'none', width: '100%', fontFamily: 'inherit' }}
                value={rejectionModal.reason}
                onChange={e => setRejectionModal(prev => ({ ...prev, reason: e.target.value }))}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                className="glass-button secondary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setRejectionModal({ open: false, studentId: null, reason: '' })}
                disabled={!!actionLoading}
              >
                Cancel
              </button>
              <button
                className="glass-button"
                style={{ flex: 1, padding: '10px', background: '#ff4b4b', boxShadow: '0 4px 15px rgba(255,75,75,0.3)' }}
                onClick={submitRejection}
                disabled={!!actionLoading || !rejectionModal.reason.trim()}
              >
                {actionLoading ? 'Rejecting...' : 'Reject Student'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Student Details Modal */}
      {selectedStudent && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
        }}>
          <div className="glass-panel" style={{
            width: '90%', maxWidth: '550px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.12)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {selectedStudent.profileImage ? (
                  <img
                    src={`http://localhost:5000/uploads/${selectedStudent.profileImage}`}
                    alt="Profile"
                    style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)' }}
                  />
                ) : (
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7b61ff, #00d2ff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem', fontWeight: '700'
                  }}>
                    {selectedStudent.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedStudent.name}</h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>ID: {selectedStudent.studentId}</p>
                </div>
              </div>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
                fontSize: '0.78rem', fontWeight: '600',
                background: `${statusColors[selectedStudent.status] || 'rgba(255,255,255,0.1)'}18`,
                color: statusColors[selectedStudent.status] || 'var(--text-secondary)',
                border: `1px solid ${statusColors[selectedStudent.status] || 'rgba(255,255,255,0.1)'}40`
              }}>{selectedStudent.status}</span>
            </div>

            {/* Student Info Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Email Address</p>
                <p style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={selectedStudent.email}>{selectedStudent.email}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Phone Number</p>
                <p style={{ fontSize: '0.9rem' }}>{selectedStudent.phone || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Department</p>
                <p style={{ fontSize: '0.9rem' }}>{selectedStudent.department?.name || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Degree Programme</p>
                <p style={{ fontSize: '0.9rem' }}>{selectedStudent.degreeProgramme?.name || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Academic Year</p>
                <p style={{ fontSize: '0.9rem' }}>{selectedStudent.academicYear || '—'}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Semester</p>
                <p style={{ fontSize: '0.9rem' }}>{selectedStudent.semester || '—'}</p>
              </div>
            </div>

            {/* ID Card Verification image */}
            <div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Student ID Card verification</p>
              {selectedStudent.idCardImage ? (
                <img
                  src={`http://localhost:5000/uploads/${selectedStudent.idCardImage}`}
                  alt="Student ID Card"
                  style={{ width: '100%', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', objectFit: 'contain', maxHeight: '200px' }}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No student ID card photo uploaded.
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '1.25rem' }}>
              <button
                className="glass-button secondary"
                style={{ flex: 1, padding: '10px' }}
                onClick={() => setSelectedStudent(null)}
              >
                Close
              </button>
              {selectedStudent.status === 'Pending Approval' && (
                <>
                  <button
                    className="glass-button"
                    style={{ flex: 1, padding: '10px', background: '#ff4b4b', boxShadow: '0 4px 15px rgba(255,75,75,0.3)' }}
                    onClick={() => {
                      const id = selectedStudent._id;
                      setSelectedStudent(null);
                      handleAction(id, 'Rejected', 'Pending Approval');
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="glass-button"
                    style={{ flex: 1, padding: '10px', background: '#00e676', boxShadow: '0 4px 15px rgba(0,230,118,0.3)' }}
                    onClick={async () => {
                      const id = selectedStudent._id;
                      setSelectedStudent(null);
                      await handleAction(id, 'Approved', 'Pending Approval');
                    }}
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminStudents;
