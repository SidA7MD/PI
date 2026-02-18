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
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
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
          <h1>
            Bonjour {user?.role === 'school' ? `École ${user?.school?.name || ''}` : user?.username} 👋
          </h1>
          <p>Bienvenue sur votre tableau de bord administrateur</p>
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
          <div className="stat-label">Professeurs</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.classes}</div>
            <div className="stat-icon warning">
              <FiBook />
            </div>
          </div>
          <div className="stat-label">Classes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.students}</div>
            <div className="stat-icon success">
              <LuSchool />
            </div>
          </div>
          <div className="stat-label">Élèves</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.todayAbsences}</div>
            <div className="stat-icon danger">
              <FiAlertCircle />
            </div>
          </div>
          <div className="stat-label">Absences Auj.</div>
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
        <FiTrendingUp /> Actions Rapides
      </h2>

      <div className="actions-grid">
        <Link to="/admin/teachers/create" className="action-card">
          <div className="action-icon">
            <LuUserPlus />
          </div>
          <div className="action-info">
            <h3>Ajouter un prof</h3>
            <p>Créer un compte enseignant</p>
          </div>
        </Link>

        <Link to="/admin/classes/create" className="action-card">
          <div className="action-icon" style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' }}>
            <LuBookOpen />
          </div>
          <div className="action-info">
            <h3>Nouvelle classe</h3>
            <p>Ajouter une classe</p>
          </div>
        </Link>

        <Link to="/admin/students/create" className="action-card">
          <div className="action-icon" style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}>
            <FiUserPlus />
          </div>
          <div className="action-info">
            <h3>Inscrire un élève</h3>
            <p>Ajouter un élève à une classe</p>
          </div>
        </Link>

        <Link to="/admin/absences" className="action-card">
          <div className="action-icon" style={{ background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' }}>
            <FiCheckSquare />
          </div>
          <div className="action-info">
            <h3>Gérer Absences</h3>
            <p>Voir les rapports d'absence</p>
          </div>
        </Link>
      </div>
    </>
  );
};

export default AdminDashboard;