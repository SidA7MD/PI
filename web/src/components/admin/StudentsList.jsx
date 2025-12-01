// src/components/admin/StudentsList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminPages.css';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/student');
        setStudents(res.data.students || []);
      } catch (err) {
        console.error('Erreur', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return <div className="loading-state">Chargement des élèves...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Élèves</h2>
        <Link to="/admin/students/create" className="add-button">
          + Ajouter un élève
        </Link>
      </div>
      <div className="content-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Classe</th>
              <th>Code unique</th>
              <th>École</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty-state">
                  Aucun élève trouvé
                </td>
              </tr>
            ) : (
              students.map(s => (
                <tr key={s._id}>
                  <td>{s.firstName} {s.lastName}</td>
                  <td>{s.class?.name || 'Non assigné'}</td>
                  <td><code style={{ background: '#f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>{s.uniqueCode}</code></td>
                  <td>{s.school?.name || '—'}</td>
                  <td>
                    <Link to={`/admin/students/edit/${s._id}`} className="action-link">Modifier</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsList;