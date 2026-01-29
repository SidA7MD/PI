// src/pages/TeacherHistory.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FaHistory, FaFilter, FaSearch, FaUser } from 'react-icons/fa';
import '../styles/TeacherHistory.css';

const TeacherHistory = () => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, absencesRes] = await Promise.all([
          api.get('/teacher/stats'),
          // Fetching absences for the first class by default if no class selected
          api.get('/teacher/classes')
        ]);
        
        setClasses(statsRes.data.classes);
        
        // Fetch all absences for all teacher's classes
        // Note: The backend getClassAbsences needs a classId, 
        // but we want a general history. For now we'll fetch per class or create a combined view.
        // Let's fetch for each class and combine for the "all" view.
        const allAbsences = await Promise.all(
          statsRes.data.classes.map(c => api.get(`/teacher/class/${c._id}/absences`))
        );
        
        const combined = allAbsences.flatMap(res => res.data.absences);
        setAbsences(combined.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (err) {
        console.error('Error fetching history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setLoading(true);
    try {
      if (classId === 'all') {
        const allAbsences = await Promise.all(
          classes.map(c => api.get(`/teacher/class/${c._id}/absences`))
        );
        const combined = allAbsences.flatMap(res => res.data.absences);
        setAbsences(combined.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } else {
        const res = await api.get(`/teacher/class/${classId}/absences`);
        setAbsences(res.data.absences);
      }
    } catch (err) {
      console.error('Error filtering history:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      absent: { class: 'status-absent', label: 'Absent' },
      retard: { class: 'status-late', label: 'Retard' },
      présent: { class: 'status-present', label: 'Présent' }
    };
    const s = config[status] || config['présent'];
    return <span className={`badge ${s.class}`}>{s.label}</span>;
  };

  if (loading && absences.length === 0) return <div className="loading">Chargement de l'historique...</div>;

  return (
    <div className="teacher-history">
      <header className="history-header">
        <div className="title-area">
          <h1><FaHistory /> Historique des absences</h1>
          <p>Consultez et gérez les pointages passés.</p>
        </div>
        
        <div className="filters">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select value={selectedClass} onChange={handleClassChange}>
              <option value="all">Toutes les classes</option>
              {classes.map(c => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="history-table-container">
        <table className="history-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Élève</th>
              <th>Classe</th>
              <th>Statut</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {absences.map((abs) => (
              <tr key={abs._id}>
                <td className="date-cell">
                  <strong>{new Date(abs.date).toLocaleDateString('fr-FR')}</strong>
                  <span>{new Date(abs.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </td>
                <td>
                  <div className="student-info">
                    <FaUser className="user-icon" />
                    {abs.student?.firstName} {abs.student?.lastName}
                  </div>
                </td>
                <td>{abs.class?.name || 'Inconnu'}</td>
                <td>{getStatusBadge(abs.status)}</td>
                <td className="notes-cell">{abs.notes || '-'}</td>
              </tr>
            ))}
            {absences.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-row">Aucun enregistrement trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeacherHistory;
