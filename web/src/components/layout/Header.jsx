// src/components/layout/Header.jsx
import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FiLogOut, FiUsers, FiBook, FiCalendar, FiHome, FiMenu, FiX, FiUser 
} from 'react-icons/fi';
import { LuGraduationCap, LuSchool } from 'react-icons/lu';
import '../../styles/Layout.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation Logic (moved from Sidebar)
  const getMenuItems = () => {
    switch (user?.role) {
      case 'school':
        return [
          { icon: <FiHome />, label: 'Dashboard', path: '/admin/dashboard' },
          { icon: <LuSchool />, label: 'Professeurs', path: '/admin/teachers' },
          { icon: <FiBook />, label: 'Classes', path: '/admin/classes' },
          { icon: <FiUsers />, label: 'Élèves', path: '/admin/students' },
          { icon: <FiCalendar />, label: 'Absences', path: '/admin/absences' },
        ];
      case 'teacher':
        return [
          { icon: <FiHome />, label: 'Dashboard', path: '/teacher/dashboard' },
          { icon: <FiCalendar />, label: 'Historique', path: '/teacher/history' },
          { icon: <FiUser />, label: 'Profil', path: '/profile' },
        ];

      case 'superadmin':
        return [
          { icon: <FiHome />, label: 'Dashboard', path: '/superadmin/dashboard' },
          { icon: <FiUser />, label: 'Profil', path: '/profile' },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/dashboard" className="header-logo">
            <div className="logo-icon">
              <LuGraduationCap />
            </div>
            <span className="logo-text">SchoolTrack</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path !== '/admin/dashboard' && item.path !== '/teacher/dashboard' && item.path !== '/parent/dashboard' && location.pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-link-top ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="header-right">
          <Link to="/profile" className="user-profile-link">
             <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user?.username}</span>
          </Link>
          
          <button onClick={logout} className="logout-btn" title="Déconnexion">
            <FiLogOut />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="mobile-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
