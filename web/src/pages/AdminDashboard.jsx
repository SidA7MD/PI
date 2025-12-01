// src/pages/AdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import api from '../services/api';
import { FaUsers, FaChalkboardTeacher, FaGraduationCap, FaCalendarAlt } from 'react-icons/fa';
import '../styles/Dashboard.css';
import '../styles/AdminPages.css';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ teachers: 0, classes: 0, students: 0, absences: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [teachersRes, classesRes, studentsRes, absencesRes] = await Promise.all([
        api.get('/admin/teachers'),
        api.get('/class'),
        api.get('/student'),
        api.get('/absence'),
      ]);

      setStats({
        teachers: teachersRes.data.count || teachersRes.data.teachers?.length || 0,
        classes: classesRes.data.count || classesRes.data.classes?.length || 0,
        students: studentsRes.data.count || studentsRes.data.students?.length || 0,
        absences: absencesRes.data.count || absencesRes.data.absences?.length || 0,
      });
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <Header />
        <div className="admin-content">
          <Sidebar />
          <main className="dashboard-main">
            <div className="loading">Chargement...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-content">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Bienvenue, {user?.username || 'Admin'}</h1>
            <p className="dashboard-subtitle">Tableau de bord de gestion des absences</p>
          </div>

          <div className="stats-grid">
            <Link to="/admin/teachers" className="stat-card">
              <div className="stat-icon teachers">
                <FaChalkboardTeacher />
              </div>
              <div className="stat-content">
                <h3>Professeurs</h3>
                <p className="stat-number">{stats.teachers}</p>
              </div>
            </Link>

            <Link to="/admin/classes" className="stat-card">
              <div className="stat-icon classes">
                <FaGraduationCap />
              </div>
              <div className="stat-content">
                <h3>Classes</h3>
                <p className="stat-number">{stats.classes}</p>
              </div>
            </Link>

            <Link to="/admin/students" className="stat-card">
              <div className="stat-icon students">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Élèves</h3>
                <p className="stat-number">{stats.students}</p>
              </div>
            </Link>

            <Link to="/admin/absences" className="stat-card">
              <div className="stat-icon absences">
                <FaCalendarAlt />
              </div>
              <div className="stat-content">
                <h3>Absences</h3>
                <p className="stat-number">{stats.absences}</p>
              </div>
            </Link>
          </div>

          <div className="quick-actions">
            <h2>Actions rapides</h2>
            <div className="actions-grid">
              <Link to="/admin/teachers/create" className="action-button">
                <FaChalkboardTeacher />
                <span>Ajouter un professeur</span>
              </Link>
              <Link to="/admin/classes/create" className="action-button">
                <FaGraduationCap />
                <span>Créer une classe</span>
              </Link>
              <Link to="/admin/students/create" className="action-button">
                <FaUsers />
                <span>Ajouter un élève</span>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;