import React, { useState, useEffect, useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { FiCalendar, FiUser, FiClock, FiAlertCircle, FiFilter } from 'react-icons/fi';
import { useSocket } from '../context/SocketContext';
import '../styles/Dashboard.css';
import '../styles/Components.css';

const TeacherHistory = () => {
  const { t, language } = useContext(LanguageContext);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const socket = useSocket();

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

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('absence:deleted', () => {
        console.log('🗑️ Absence deleted, refreshing teacher history...');
        fetchHistory();
      });
      return () => socket.off('absence:deleted');
    }
  }, [socket]);

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
            {t('absences_history')}
          </h1>
          <p className="page-subtitle">{t('view_reported_absences')}</p>
        </div>
      </div>

      <div className="filter-bar">
        {[
          { id: 'all', label: t('filter_all'), icon: <FiFilter /> },
          { id: 'today', label: t('filter_today'), icon: <FiCalendar /> },
          { id: 'week', label: t('filter_week'), icon: <FiClock /> }
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
            <div className="empty-text">{t('no_absences_recorded')}</div>
            <div className="empty-subtext">{language === 'ar' ? 'لم يتم العثور على غيابات لهذه الفترة' : 'Aucune absence trouvée pour cette période'}</div>
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
                  {absence.status === 'retard' ? t('late') : t('absent')}
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
