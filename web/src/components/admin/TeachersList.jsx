// src/components/admin/TeachersList.jsx
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import '../../styles/AdminPages.css';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error('Erreur lors du chargement des professeurs', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce professeur ?')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        setTeachers(teachers.filter(t => t._id !== id));
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
        <h2>Professeurs</h2>
        <Link to="/admin/teachers/create" className="add-button">
          + Ajouter un professeur
        </Link>
      </div>
      <div className="content-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nom d'utilisateur</th>
              <th>Téléphone</th>
              <th>Classes assignées</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachers.length === 0 ? (
              <tr>
                <td colSpan="4" className="empty-state">
                  Aucun professeur trouvé
                </td>
              </tr>
            ) : (
              teachers.map(teacher => (
                <tr key={teacher._id}>
                  <td>{teacher.username}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.classes?.map(c => c.name).join(', ') || 'Aucune'}</td>
                  <td>
                    <Link to={`/admin/teachers/edit/${teacher._id}`} className="action-link">Modifier</Link>
                    <button onClick={() => deleteTeacher(teacher._id)} className="delete-button">Supprimer</button>
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

export default TeachersList;