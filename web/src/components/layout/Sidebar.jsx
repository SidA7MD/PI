// src/components/layout/Sidebar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaUsers, 
  FaCalendarAlt,
  FaTachometerAlt,
  FaSchool
} from 'react-icons/fa';
import '../layout/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Tableau de bord' },
    { path: '/admin/teachers', icon: FaChalkboardTeacher, label: 'Professeurs' },
    { path: '/admin/classes', icon: FaGraduationCap, label: 'Classes' },
    { path: '/admin/students', icon: FaUsers, label: 'Élèves' },
    { path: '/admin/absences', icon: FaCalendarAlt, label: 'Absences' },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
          
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

export default Sidebar;

