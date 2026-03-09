// src/components/layout/Header.jsx
import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { LanguageContext } from '../../context/LanguageContext';
import {
  FiLogOut, FiUsers, FiBook, FiCalendar, FiHome, FiMenu, FiX, FiUser, FiFileText, FiGlobe
} from 'react-icons/fi';
import { LuGraduationCap, LuSchool } from 'react-icons/lu';
import '../../styles/Layout.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const { language, setLanguage, t } = useContext(LanguageContext);
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'fr' ? 'ar' : 'fr');
  };

  // Navigation Logic (moved from Sidebar)
  const getMenuItems = () => {
    switch (user?.role) {
      case 'school':
        return [
          { icon: <FiHome />, label: t('dashboard'), path: '/admin/dashboard' },
          { icon: <LuSchool />, label: t('teachers'), path: '/admin/teachers' },
          { icon: <FiBook />, label: t('classes'), path: '/admin/classes' },
          { icon: <FiUsers />, label: t('students'), path: '/admin/students' },
          { icon: <FiCalendar />, label: t('absences'), path: '/admin/absences' },
        ];
      case 'teacher':
        return [
          { icon: <FiHome />, label: t('dashboard'), path: '/teacher/dashboard' },
          { icon: <FiCalendar />, label: t('history'), path: '/teacher/history' },
          { icon: <FiUser />, label: t('profile'), path: '/profile' },
        ];

      case 'superadmin':
        return [
          { icon: <FiHome />, label: t('dashboard'), path: '/superadmin/dashboard' },
          { icon: <FiUser />, label: t('profile'), path: '/profile' },
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="logo-text">Khbarwelli</span>
              {user?.role === 'school' && user?.school?.name && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'var(--gray-500)',
                  letterSpacing: '0.3px'
                }}>
                  {user.school.name}
                </span>
              )}
            </div>
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
            <span className="user-name">
              {user?.role === 'school' && user?.school?.name ? `${t('school_label')} ${user.school.name}` : user?.username}
            </span>
          </Link>

          <button onClick={toggleLanguage} className="lang-toggle-btn" title={language === 'fr' ? 'العربية' : 'Français'}>
            <FiGlobe />
            <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>

          <button onClick={logout} className="logout-btn" title={t('logout')}>
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
