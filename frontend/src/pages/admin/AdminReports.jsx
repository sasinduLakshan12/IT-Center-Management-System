import React, { useEffect, useState } from 'react';
import { BarChart2, TrendingUp, Monitor, Users, Activity, Calendar } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const AdminReports = () => {
  const [stats, setStats] = useState(null);
  const [utilization, setUtilization] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, utilRes] = await Promise.all([
          API.get('/reports/dashboard'),
          API.get('/reports/utilization')
        ]);
        setStats(statsRes.data.data);
        setUtilization(utilRes.data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, []);

  const maxSessions = Math.max(...utilization.map(d => d.totalSessions), 1);

  const dayLabels = {
    '0': 'Sun', '1': 'Mon', '2': 'Tue', '3': 'Wed',
    '4': 'Thu', '5': 'Fri', '6': 'Sat'
  };

  return (
    <DashboardLayout>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Reports & Analytics</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>Overview of IT Center usage and performance.</p>
      </div>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading reports...</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {[
              { label: 'Total Computers', value: stats?.computers.total, icon: <Monitor size={22} />, color: '#7b61ff' },
              { label: 'Available Now', value: stats?.computers.available, icon: <Activity size={22} />, color: '#00e676' },
              { label: 'Active Sessions', value: stats?.bookings.activeSessions, icon: <TrendingUp size={22} />, color: '#00d2ff' },
              { label: 'Total Students', value: stats?.students.total, icon: <Users size={22} />, color: '#ff9800' },
              { label: 'Pending Approvals', value: stats?.students.pendingApprovals, icon: <Users size={22} />, color: '#ff4b4b' },
              { label: 'Waiting List', value: stats?.bookings.waitingListSize, icon: <Calendar size={22} />, color: '#a78bfa' },
            ].map(c => (
              <div key={c.label} className="glass-panel" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${c.color}18`, border: `1px solid ${c.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color }}>
                    {c.icon}
                  </div>
                </div>
                <p style={{ fontSize: '1.8rem', fontWeight: '700', color: c.color }}>{c.value ?? '—'}</p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '3px' }}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Utilization Chart */}
          <div className="glass-panel" style={{ padding: '1.75rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Session Activity</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Last 7 days</p>
              </div>
              <BarChart2 size={22} color="var(--accent-color)" />
            </div>

            {utilization.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No session data yet.</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px' }}>
                {utilization.map((day, i) => {
                  const heightPct = (day.totalSessions / maxSessions) * 100;
                  const dateObj = new Date(day._id);
                  const label = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: '600' }}>{day.totalSessions}</span>
                      <div style={{
                        width: '100%', borderRadius: '6px 6px 0 0',
                        background: `linear-gradient(180deg, #7b61ff, #00d2ff)`,
                        height: `${Math.max(heightPct, 4)}%`,
                        transition: 'height 0.6s ease',
                        boxShadow: '0 -4px 16px rgba(123,97,255,0.4)'
                      }} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Computer Status Breakdown */}
          <div className="glass-panel" style={{ padding: '1.75rem' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '1.25rem' }}>Computer Status Breakdown</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Available', value: stats?.computers.available, total: stats?.computers.total, color: '#00e676' },
                { label: 'In Use', value: stats?.computers.inUse, total: stats?.computers.total, color: '#7b61ff' },
                { label: 'Maintenance', value: stats?.computers.maintenance, total: stats?.computers.total, color: '#ff9800' },
              ].map(row => {
                const pct = row.total > 0 ? Math.round((row.value / row.total) * 100) : 0;
                return (
                  <div key={row.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: '600', color: row.color }}>{row.value} ({pct}%)</span>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '8px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: row.color, borderRadius: '8px', transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminReports;
