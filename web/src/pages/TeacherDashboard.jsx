// src/pages/TeacherDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
// Header and Sidebar imports removed
import api from '../services/api';
import { 
  FiUsers, FiClock, FiCalendar, FiCheckCircle, FiAlertTriangle 
} from 'react-icons/fi';
import { LuSchool, LuGraduationCap } from 'react-icons/lu';
import '../styles/Dashboard.css';

const TeacherDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    todayStats: { absences: 0, lates: 0 },
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch stats and classes. 
        // Assuming /teacher/stats returns aggregated data including classes list
        // based on my previous controller update or existing logic.
        // Actually earlier code used /teacher/stats which returned:
        // { totalClasses, totalStudents, todayStats, weeklyStats, classes: [...] }
        const res = await api.get('/teacher/stats');
        setStats({
          totalClasses: res.data.totalClasses,
          totalStudents: res.data.totalStudents,
          todayStats: res.data.todayStats,
        });
        setClasses(res.data.classes || []);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Bonjour, {user?.username} 👨‍🏫</h1>
          <p>Prêt pour faire l'appel aujourd'hui ?</p>
        </div>
        <LuSchool className="welcome-decoration" />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.totalClasses}</div>
            <div className="stat-icon info">
              <LuSchool />
            </div>
          </div>
          <div className="stat-label">Mes Classes</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.totalStudents}</div>
            <div className="stat-icon success">
              <FiUsers />
            </div>
          </div>
          <div className="stat-label">Total Élèves</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.todayStats.absences}</div>
            <div className="stat-icon danger">
              <FiAlertTriangle />
            </div>
          </div>
          <div className="stat-label">Absences Auj.</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{stats.todayStats.lates}</div>
            <div className="stat-icon warning">
              <FiClock />
            </div>
          </div>
          <div className="stat-label">Retards Auj.</div>
        </div>
      </div>

      <h2 className="page-title" style={{ fontSize: '20px', marginBottom: '20px' }}>
        <LuGraduationCap /> Mes Classes
      </h2>

      <div className="cards-grid">
        {classes.length === 0 ? (
          <div className="empty-state">
            <LuSchool className="empty-icon" />
            <div className="empty-text">Aucune classe assignée</div>
            <div className="empty-subtext">Contactez l'administrateur si nécessaire</div>
          </div>
        ) : (
          classes.map((cls) => (
            <Link key={cls._id} to={`/teacher/attendance/${cls._id}`} className="item-card action-card">
              <div className="card-header">
                 <div className="item-badge primary">
                    {cls.name.charAt(0)}
                 </div>
                 <div className="chip">
                   {cls.studentCount} élèves
                 </div>
              </div>

              <div className="item-title">{cls.name}</div>
              
              <div className="item-subtitle" style={{ marginBottom: '12px' }}>
                 <span style={{ color: 'var(--danger)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                   <FiAlertTriangle size={14} /> {cls.todayAbsences} absents auj.
                 </span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid var(--gray-100)', color: 'var(--primary-600)', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Faire l'appel <FiCheckCircle />
              </div>
            </Link>
          ))
        )}
      </div>
    </>
  );
};

export default TeacherDashboard;
