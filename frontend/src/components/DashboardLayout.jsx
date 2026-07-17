import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '240px',
        padding: '2rem',
        minHeight: '100vh',
        transition: 'margin-left 0.3s ease'
      }}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
