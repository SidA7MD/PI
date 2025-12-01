// src/components/admin/AbsencesDashboard.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import '../../styles/AdminPages.css';

const AbsencesDashboard = () => {
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAbsences();
  }, []);

  const fetchAbsences = async () => {
    try {
      const res = await api.get('/absence');
      setAbsences(res.data.absences || []);
    } catch (err) {
      console.error('Erreur absences', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-state">Chargement...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Historique des absences</h2>
      </div>
      <div className="content-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Classe</th>
              <th>Professeur</th>
              <th>Date</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {absences.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  Aucune absence enregistrée
                </td>
              </tr>
            ) : (
              absences.map(absence => (
                <tr key={absence._id}>
                  <td>{absence.student?.firstName} {absence.student?.lastName}</td>
                  <td>{absence.class?.name || 'Inconnu'}</td>
                  <td>{absence.teacher?.username || 'Inconnu'}</td>
                  <td>{new Date(absence.date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: absence.status === 'justified' ? '#d4edda' : '#f8d7da',
                      color: absence.status === 'justified' ? '#155724' : '#721c24'
                    }}>
                      {absence.status || 'Non justifié'}
                    </span>
                  </td>
                  <td>{absence.notes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AbsencesDashboard;