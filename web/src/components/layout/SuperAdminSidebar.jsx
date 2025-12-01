// src/components/layout/SuperAdminSidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTachometerAlt } from 'react-icons/fa';
import '../layout/Sidebar.css';

const SuperAdminSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/superadmin/dashboard', icon: FaTachometerAlt, label: 'Tableau de bord' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon className="sidebar-icon" />
              <span className="sidebar-label">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SuperAdminSidebar;

