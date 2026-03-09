// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  FiUsers, FiBook, FiCheckSquare, FiUserPlus,
  FiTrendingUp, FiClock, FiAlertCircle
} from 'react-icons/fi';
import { LuSchool, LuUserPlus, LuBookOpen } from 'react-icons/lu';
import { useSocket } from '../context/SocketContext';
import { LanguageContext } from '../context/LanguageContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);
  const [stats, setStats] = useState({
    teachers: 0,
    students: 0,
    classes: 0,
    todayAbsences: 0,
  });
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('absence:deleted', () => {
        console.log('🗑️ Data updated, refreshing dashboard stats...');
        fetchStats();
      });
      return () => socket.off('absence:deleted');
    }
  }, [socket]);

  return (
    <>
      <div className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-avatar">
            {user?.school?.name?.charAt(0).toUpperCase() || (user?.username?.charAt(0).toUpperCase() || 'A')}
          </div>
          <div className="greeting-text-container">
            <h1>
              {language === 'ar' ? 'مرحباً' : 'Bonjour'} {user?.role === 'school' ? (language === 'ar' ? `مدرسة ${user?.school?.name || ''}` : `École ${user?.school?.name || ''}`) : user?.username} {language === 'ar' ? '👋' : '👋'}
            </h1>
            <p>{t('welcome_admin')}</p>
          </div>
        </div>
        <LuSchool className="welcome-decoration" />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.teachers}</div>
            <div className="stat-icon info">
              <FiUsers />
            </div>
          </div>
          <div className="stat-label">{t('teachers')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.classes}</div>
            <div className="stat-icon warning">
              <FiBook />
            </div>
          </div>
          <div className="stat-label">{t('classes')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.students}</div>
            <div className="stat-icon success">
              <LuSchool />
            </div>
          </div>
          <div className="stat-label">{t('students')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.todayAbsences}</div>
            <div className="stat-icon danger">
              <FiAlertCircle />
            </div>
          </div>
          <div className="stat-label">{t('today_absences')}</div>
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
        <FiTrendingUp /> {t('quick_actions')}
      </h2>

      <div className="actions-grid">
        <Link to="/admin/teachers/create" className="action-card">
          <div className="action-icon">
            <LuUserPlus />
          </div>
          <div className="action-info">
            <h3>{t('add_teacher')}</h3>
            <p>{t('create_teacher_account')}</p>
          </div>
        </Link>

        <Link to="/admin/classes/create" className="action-card">
          <div className="action-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <LuBookOpen />
          </div>
          <div className="action-info">
            <h3>{t('new_class')}</h3>
            <p>{t('add_class')}</p>
          </div>
        </Link>

        <Link to="/admin/students/create" className="action-card">
          <div className="action-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiUserPlus />
          </div>
          <div className="action-info">
            <h3>{t('enroll_student')}</h3>
            <p>{t('add_student_to_class')}</p>
          </div>
        </Link>

        <Link to="/admin/absences" className="action-card">
          <div className="action-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiCheckSquare />
          </div>
          <div className="action-info">
            <h3>{t('manage_absences')}</h3>
            <p>{t('view_absence_reports')}</p>
          </div>
        </Link>
      </div>
    </>
  );
};

export default AdminDashboard;