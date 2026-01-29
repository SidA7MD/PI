// src/pages/TeacherDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaClock, 
  FaCheckCircle,
  FaChalkboardTeacher,
  FaArrowRight
} from 'react-icons/fa';
import '../styles/TeacherDashboard.css';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/teacher/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching teacher stats:', err);
        setError('Impossible de charger les statistiques.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div className="loading">Chargement du tableau de bord...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="teacher-dashboard">
      <header className="dashboard-header">
        <h1>Bonjour, {user?.username} ! 👨‍🏫</h1>
        <p className="subtitle">Bienvenue sur votre espace enseignant.</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card total-students">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>{stats?.totalStudents || 0}</h3>
            <p>Total Élèves</p>
          </div>
        </div>
        <div className="stat-card today-absences">
          <div className="stat-icon"><FaCalendarCheck /></div>
          <div className="stat-info">
            <h3>{stats?.todayStats.absences || 0}</h3>
            <p>Absences aujourd'hui</p>
          </div>
        </div>
        <div className="stat-card today-lates">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-info">
            <h3>{stats?.todayStats.lates || 0}</h3>
            <p>Retards aujourd'hui</p>
          </div>
        </div>
        <div className="stat-card attendance-rate">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-info">
            <h3>{stats?.weeklyStats.attendanceRate || 0}%</h3>
            <p>Taux de présence (7j)</p>
          </div>
        </div>
      </div>

      <section className="classes-section">
        <h2>Mes Classes</h2>
        <div className="classes-grid">
          {stats?.classes.map((cls) => (
            <div key={cls._id} className="class-card">
              <div className="class-icon"><FaChalkboardTeacher /></div>
              <div className="class-content">
                <h3>{cls.name}</h3>
                <p className="level">{cls.level}</p>
                <div className="class-meta">
                  <span><strong>{cls.studentCount}</strong> élèves</span>
                  <span><strong>{cls.todayAbsences}</strong> absences aujourd'hui</span>
                </div>
              </div>
              <div className="class-actions">
                <button 
                  className="btn-attendance"
                  onClick={() => navigate(`/teacher/attendance/${cls._id}`)}
                >
                  Faire l'appel <FaArrowRight />
                </button>
              </div>
            </div>
          ))}
          {(!stats?.classes || stats.classes.length === 0) && (
            <p className="empty-msg">Aucune classe assignée pour le moment.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default TeacherDashboard;
