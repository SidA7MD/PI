// src/components/admin/ClassesList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import '../../styles/AdminPages.css';

const ClassesList = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/class');
      setClasses(res.data.classes || []);
    } catch (err) {
      console.error('Erreur classes', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteClass = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cette classe ?')) {
      try {
        await api.delete(`/class/${id}`);
        setClasses(classes.filter(c => c._id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return <div className="loading-state">Chargement...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h2>Classes</h2>
        <Link to="/admin/classes/create" className="add-button">
          + Créer une classe
        </Link>
      </div>
      <div className="content-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Professeurs</th>
              <th>Élèves</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  Aucune classe trouvée
                </td>
              </tr>
            ) : (
              classes.map(cls => (
                <tr key={cls._id}>
                  <td>{cls.name}</td>
                  <td>{cls.teachers?.map(t => t.username).join(', ') || 'Aucun'}</td>
                  <td>{cls.students?.length || 0}</td>
                  <td>
                    <Link to={`/admin/classes/edit/${cls._id}`} className="action-link">Modifier</Link>
                    <button onClick={() => deleteClass(cls._id)} className="delete-button">Supprimer</button>
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

export default ClassesList;