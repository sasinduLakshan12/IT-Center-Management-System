import React, { useEffect, useState } from 'react';
import { Monitor, Users, Calendar, Activity, ClipboardList, BarChart2, TrendingUp, UserCheck } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout';
import API from '../../utils/api';

const StatCard = ({ icon, label, value, color, sublabel }) => (
  <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>{label}</p>
        <p style={{ fontSize: '2rem', fontWeight: '700' }}>{value ?? '—'}</p>
        {sublabel && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{sublabel}</p>}
      </div>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: `${color}22`, border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color
      }}>{icon}</div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/reports/dashboard');
        setStats(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const computerUtilPct = stats
    ? Math.round(((stats.computers.inUse) / stats.computers.total) * 100) || 0
    : 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '700' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.4rem' }}>
          IT Center Management System — Overview
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>Loading dashboard data...</div>
      ) : (
        <>
          {/* Computer Status Row */}
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Computer Status</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <StatCard icon={<Monitor size={22} />} label="Total Computers" value={stats?.computers.total} color="#7b61ff" sublabel="In system" />
              <StatCard icon={<Activity size={22} />} label="In Use Right Now" value={stats?.computers.inUse} color="#00e676" sublabel="Active sessions" />
              <StatCard icon={<Monitor size={22} />} label="Available" value={stats?.computers.available} color="#00d2ff" sublabel="Ready to book" />
              <StatCard icon={<Monitor size={22} />} label="Maintenance" value={stats?.computers.maintenance} color="#ff9800" sublabel="Offline" />
            </div>
          </div>

          {/* Utilization Progress Bar */}
          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <p style={{ fontWeight: '600' }}>Computer Utilization</p>
              <p style={{ color: computerUtilPct > 70 ? '#00e676' : 'var(--text-secondary)', fontWeight: '600' }}>{computerUtilPct}%</p>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${computerUtilPct}%`,
                background: computerUtilPct > 70
                  ? 'linear-gradient(90deg, #00e676, #00b04d)'
                  : 'linear-gradient(90deg, #7b61ff, #00d2ff)',
                borderRadius: '8px', transition: 'width 0.6s ease'
              }} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              {stats?.computers.inUse} of {stats?.computers.total} computers currently in use
            </p>
          </div>

          {/* Booking & Student Stats */}
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Today's Activity</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
              <StatCard icon={<Calendar size={22} />} label="Bookings Today" value={stats?.bookings.todayTotal} color="#7b61ff" />
              <StatCard icon={<Activity size={22} />} label="Active Sessions" value={stats?.bookings.activeSessions} color="#00e676" />
              <StatCard icon={<TrendingUp size={22} />} label="Completed Today" value={stats?.bookings.completedToday} color="#00d2ff" />
              <StatCard icon={<ClipboardList size={22} />} label="Waiting List" value={stats?.bookings.waitingListSize} color="#ff9800" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1.5rem' }}>
            <StatCard icon={<Users size={22} />} label="Total Students" value={stats?.students.total} color="#7b61ff" sublabel="Registered" />
            <StatCard icon={<UserCheck size={22} />} label="Pending Approvals" value={stats?.students.pendingApprovals} color="#ff9800" sublabel="Awaiting approval" />
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
