// src/pages/ParentAbsences.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { useSearchParams } from 'react-router-dom';
import { 
  FaCalendarAlt,
  FaUserGraduate,
  FaFilter,
  FaChalkboardTeacher,
  FaInfoCircle
} from 'react-icons/fa';
import '../styles/ParentAbsences.css';

const ParentAbsences = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const [absences, setAbsences] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(searchParams.get('child') || 'all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [absencesRes, childrenRes] = await Promise.all([
          api.get('/parent/absences'),
          api.get('/parent/students'),
        ]);
        setAbsences(absencesRes.data.absences || []);
        setChildren(childrenRes.data.students || []);
      } catch (err) {
        console.error('Error fetching absences:', err);
        setError('Impossible de charger les absences.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (childId) => {
    setSelectedChild(childId);
    if (childId === 'all') {
      searchParams.delete('child');
    } else {
      searchParams.set('child', childId);
    }
    setSearchParams(searchParams);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'absent':
        return 'status-absent';
      case 'retard':
      case 'late':
        return 'status-late';
      case 'justifié':
      case 'justified':
        return 'status-justified';
      default:
        return 'status-default';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const filteredAbsences = selectedChild === 'all'
    ? absences
    : absences.filter(abs => abs.student?._id === selectedChild);

  if (loading) return <div className="loading">Chargement des absences...</div>;
  if (error) return <div className="error-container">{error}</div>;

  return (
    <div className="parent-absences">
      <header className="absences-header">
        <div>
          <h1>Historique des Absences</h1>
          <p className="subtitle">{filteredAbsences.length} absence{filteredAbsences.length !== 1 ? 's' : ''}</p>
        </div>
      </header>

      <div className="filter-section">
        <div className="filter-label">
          <FaFilter /> Filtrer par enfant :
        </div>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${selectedChild === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            Tous les enfants
          </button>
          {children.map((child) => (
            <button
              key={child._id}
              className={`filter-btn ${selectedChild === child._id ? 'active' : ''}`}
              onClick={() => handleFilterChange(child._id)}
            >
              {child.firstName} {child.lastName}
            </button>
          ))}
        </div>
      </div>

      <div className="absences-list">
        {filteredAbsences.length === 0 ? (
          <div className="empty-state">
            <FaCalendarAlt size={64} />
            <h3>Aucune absence</h3>
            <p>
              {selectedChild === 'all'
                ? 'Tous vos enfants sont présents'
                : 'Cet enfant n\'a aucune absence enregistrée'}
            </p>
          </div>
        ) : (
          filteredAbsences.map((absence) => (
            <div key={absence._id} className="absence-card">
              <div className="absence-header">
                <div className="student-info">
                  <FaUserGraduate className="student-icon" />
                  <div>
                    <h3>{absence.student?.firstName} {absence.student?.lastName}</h3>
                    {absence.class && (
                      <p className="class-name">
                        <FaChalkboardTeacher /> {absence.class.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className={`status-badge ${getStatusColor(absence.status)}`}>
                  {absence.status || 'Absent'}
                </div>
              </div>

              <div className="absence-details">
                <div className="detail-row">
                  <FaCalendarAlt />
                  <span>{formatDate(absence.date)}</span>
                </div>
                {absence.teacher && (
                  <div className="detail-row">
                    <FaChalkboardTeacher />
                    <span>Enseignant: {absence.teacher.username}</span>
                  </div>
                )}
                {absence.reason && (
                  <div className="detail-row reason">
                    <FaInfoCircle />
                    <span>{absence.reason}</span>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentAbsences;
