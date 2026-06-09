import React from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';

const AdminHeader = ({ onMenuClick }) => {
  const { user, logout } = useAdminAuth();

  return (
    <header style={{ backgroundColor: '#131A22', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <button onClick={onMenuClick} style={{ background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}>
        ☰
      </button>
      <h1 style={{ margin: 0, color: '#FF9900', fontSize: '24px' }}>Admin Panel</h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span>{user?.email}</span>
        <button onClick={logout} style={{ padding: '8px 16px', backgroundColor: '#FF9900', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
