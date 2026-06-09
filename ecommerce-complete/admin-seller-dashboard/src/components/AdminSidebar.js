import React from 'react';
import { Link } from 'react-router-dom';

const AdminSidebar = ({ isOpen }) => {
  const menuItems = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Products', path: '/products' },
    { label: 'Orders', path: '/orders' },
    { label: 'Offers', path: '/offers' }
  ];

  return (
    <aside style={{
      width: isOpen ? '250px' : '0',
      backgroundColor: '#F9FAFB',
      borderRight: '1px solid #E5E7EB',
      transition: 'width 0.3s ease',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <nav style={{ padding: '24px 0' }}>
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'block',
              padding: '12px 24px',
              color: '#111827',
              textDecoration: 'none',
              borderLeft: '4px solid transparent',
              transition: 'all 0.3s ease',
              borderLeft: window.location.pathname === item.path ? '4px solid #FF9900' : '4px solid transparent',
              backgroundColor: window.location.pathname === item.path ? '#FFF5EB' : 'transparent'
            }}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
