// src/components/admin/StudentForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminPages.css';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    class: '', // pour l'assignation après création
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const classesRes = await api.get('/class');
        setClasses(classesRes.data.classes || []);

        if (id) {
          const studentRes = await api.get(`/student/${id}`);
          const student = studentRes.data.student;
          setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            class: student.class?._id || '',
          });
        }
      } catch (err) {
        console.error('Erreur chargement données', err);
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) {
        // Mise à jour
        await api.put(`/student/${id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          classId: formData.class || undefined,
        });
      } else {
        // Création
        await api.post('/admin/create-student', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          classId: formData.class || null,
        });
      }

      navigate('/admin/students');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{id ? 'Modifier' : 'Ajouter'} un élève</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Prénom</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label>Nom</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label>Date de naissance (optionnel)</label>
          <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} disabled={loading} />
        </div>
        <div className="form-group">
          <label>Classe {id ? '(modifier l\'assignation)' : '(assignation après création)'}</label>
          <select name="class" value={formData.class} onChange={handleChange} disabled={loading}>
            <option value="">{id ? 'Retirer de la classe' : 'Ne pas assigner maintenant'}</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'En cours...' : id ? 'Mettre à jour' : 'Créer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/students')} disabled={loading}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentForm;