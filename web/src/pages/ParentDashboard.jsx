// src/pages/ParentDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaCalendarCheck, 
  FaClock, 
  FaCheckCircle,
  FaUserGraduate,
  FaArrowRight,
  FaLink
} from 'react-icons/fa';
import '../styles/ParentDashboard.css';

const ParentDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/parent/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching parent stats:', err);
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
    <div className="parent-dashboard">
      <header className="dashboard-header">
        <h1>Bienvenue, {user?.username} ! 👋</h1>
        <p className="subtitle">Tableau de bord parent</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card total-children">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-info">
            <h3>{stats?.totalChildren || 0}</h3>
            <p>Enfant{stats?.totalChildren !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="stat-card total-absences">
          <div className="stat-icon"><FaCalendarCheck /></div>
          <div className="stat-info">
            <h3>{stats?.totalAbsences || 0}</h3>
            <p>Absences totales</p>
          </div>
        </div>
        <div className="stat-card recent-absences">
          <div className="stat-icon"><FaClock /></div>
          <div className="stat-info">
            <h3>{stats?.recentAbsences || 0}</h3>
            <p>Cette semaine</p>
          </div>
        </div>
        <div className="stat-card attendance-rate">
          <div className="stat-icon"><FaCheckCircle /></div>
          <div className="stat-info">
            <h3>
              {stats?.totalChildren 
                ? Math.round((1 - (stats.recentAbsences / (stats.totalChildren * 5))) * 100)
                : 100}%
            </h3>
            <p>Taux de présence</p>
          </div>
        </div>
      </div>

      <section className="children-section">
        <div className="section-header">
          <h2>Mes Enfants</h2>
          <button 
            className="btn-link-child"
            onClick={() => navigate('/parent/link-child')}
          >
            <FaLink /> Lier un enfant
          </button>
        </div>
        <div className="children-grid">
          {stats?.children && stats.children.length > 0 ? (
            stats.children.map((child) => (
              <div key={child.id} className="child-card">
                <div className="child-icon"><FaUserGraduate /></div>
                <div className="child-content">
                  <h3>{child.firstName} {child.lastName}</h3>
                  {child.class && (
                    <p className="class-info">{child.class.name} - {child.class.level}</p>
                  )}
                  <div className="child-stats">
                    <span>
                      <strong>{child.totalAbsences}</strong> absence{child.totalAbsences !== 1 ? 's' : ''}
                    </span>
                    {child.recentAbsences > 0 && (
                      <span className="recent-badge">
                        {child.recentAbsences} cette semaine
                      </span>
                    )}
                  </div>
                </div>
                <div className="child-actions">
                  <button 
                    className="btn-view-absences"
                    onClick={() => navigate(`/parent/absences?child=${child.id}`)}
                  >
                    Voir les absences <FaArrowRight />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <FaUsers size={64} />
              <h3>Aucun enfant lié</h3>
              <p>Demandez le code unique à l'école de votre enfant pour le lier à votre compte</p>
              <button 
                className="btn-primary"
                onClick={() => navigate('/parent/link-child')}
              >
                <FaLink /> Lier un enfant
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ParentDashboard;
