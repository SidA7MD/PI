// src/components/layout/Sidebar.jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaChalkboardTeacher, 
  FaGraduationCap, 
  FaUsers, 
  FaCalendarAlt,
  FaTachometerAlt,
  FaHistory
} from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';
import '../layout/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);

  const adminItems = [
    { path: '/admin/dashboard', icon: FaTachometerAlt, label: 'Tableau de bord' },
    { path: '/admin/teachers', icon: FaChalkboardTeacher, label: 'Professeurs' },
    { path: '/admin/classes', icon: FaGraduationCap, label: 'Classes' },
    { path: '/admin/students', icon: FaUsers, label: 'Élèves' },
    { path: '/admin/absences', icon: FaCalendarAlt, label: 'Absences' },
  ];

  const teacherItems = [
    { path: '/teacher/dashboard', icon: FaTachometerAlt, label: 'Tableau de bord' },
    { path: '/teacher/classes', icon: FaGraduationCap, label: 'Mes Classes' },
    { path: '/teacher/history', icon: FaHistory, label: 'Historique' },
  ];

  const menuItems = user?.role === 'teacher' ? teacherItems : adminItems;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path !== '/admin/dashboard' && item.path !== '/teacher/dashboard' && location.pathname.startsWith(item.path));
          
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

