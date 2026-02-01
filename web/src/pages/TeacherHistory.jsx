// src/pages/TeacherHistory.jsx
import React, { useState, useEffect } from 'react';
// Header and Sidebar imports removed
import api from '../services/api';
import { FiCalendar, FiUser, FiClock, FiAlertCircle, FiFilter } from 'react-icons/fi';
import '../styles/Dashboard.css';
import '../styles/Components.css';

const TeacherHistory = () => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/teacher/absences');
        setAbsences(res.data.absences || []);
      } catch (err) {
        console.error('Error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filteredAbsences = absences.filter(a => {
    if (filter === 'all') return true;
    if (filter === 'today') {
      return new Date(a.date).toDateString() === new Date().toDateString();
    }
    if (filter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(a.date) >= weekAgo;
    }
    return true;
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiClock className="text-primary-600" />
            Historique des Absences
          </h1>
          <p className="page-subtitle">Consultez les absences signalées</p>
        </div>
      </div>

      <div className="filter-bar">
        {[
          { id: 'all', label: 'Tout', icon: <FiFilter /> },
          { id: 'today', label: 'Aujourd\'hui', icon: <FiCalendar /> },
          { id: 'week', label: 'Cette semaine', icon: <FiClock /> }
        ].map(f => (
          <button
            key={f.id}
            className={`chip ${filter === f.id ? 'active-chip' : ''}`}
            style={{ 
              background: filter === f.id ? 'var(--primary-600)' : 'white',
              color: filter === f.id ? 'white' : 'var(--gray-600)',
              border: `1px solid ${filter === f.id ? 'var(--primary-600)' : 'var(--gray-300)'}`,
              fontSize: '14px',
              padding: '8px 16px',
              cursor: 'pointer'
            }}
            onClick={() => setFilter(f.id)}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      <div className="cards-grid">
        {filteredAbsences.length === 0 ? (
          <div className="empty-state">
            <FiAlertCircle className="empty-icon" style={{ color: 'var(--success)' }} />
            <div className="empty-text">Aucune absence</div>
            <div className="empty-subtext">Aucune absence trouvée pour cette période</div>
          </div>
        ) : (
          filteredAbsences.map(absence => (
            <div key={absence._id} className="item-card">
              <div className="card-header">
                <div className="item-badge" style={{ background: 'var(--gray-100)' }}>
                  {absence.student?.firstName?.charAt(0)}
                </div>
                <div className="chip" style={{ 
                  background: absence.status === 'retard' ? 'var(--warning-bg)' : 'var(--danger-bg)',
                  color: absence.status === 'retard' ? 'var(--warning)' : 'var(--danger)'
                }}>
                  {absence.status === 'retard' ? 'Retard' : 'Absent'}
                </div>
              </div>

              <div className="item-title">{absence.student?.firstName} {absence.student?.lastName}</div>
              <div className="item-subtitle">
                <span style={{ fontWeight: '600', color: 'var(--primary-600)' }}>{absence.class?.name}</span>
              </div>

              <div style={{ marginTop: 'auto', fontSize: '13px', color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCalendar size={12} />
                {new Date(absence.date).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TeacherHistory;
