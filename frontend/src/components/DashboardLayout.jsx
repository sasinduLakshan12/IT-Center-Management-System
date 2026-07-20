import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Mobile Top Navbar */}
      <div className="mobile-top-nav" style={{
        display: 'none',
        position: 'fixed',
        top: 0, left: 0, right: 0,
        height: '60px',
        background: 'rgba(9, 9, 30, 0.8)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 90,
        alignItems: 'center',
        padding: '0 1.25rem',
        justifyContent: 'space-between'
      }}>
        <button onClick={() => setSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Menu size={24} />
        </button>
        <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.05em' }}>IT Center MS</span>
        <div style={{ width: '24px' }}></div> {/* Spacer */}
      </div>

      <Sidebar mobileOpen={sidebarOpen} setMobileOpen={setSidebarOpen} />
      
      {/* Overlay when sidebar is open on mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="sidebar-overlay" style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 95
        }} />
      )}

      <main className="dashboard-main" style={{
        flex: 1,
        marginLeft: '240px',
        padding: '2rem',
        minHeight: '100vh',
        minWidth: 0,
        transition: 'margin-left 0.3s ease, padding 0.3s ease'
      }}>
        {children}
      </main>

      <style>{`
        @media (max-width: 768px) {
          .mobile-top-nav {
            display: flex !important;
          }
          .dashboard-main {
            margin-left: 0 !important;
            padding: 5.5rem 1rem 2rem !important; /* Top padding to clear mobile top nav */
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
