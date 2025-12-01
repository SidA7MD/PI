// src/components/admin/TeacherForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminPages.css';

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    password: '',
    class: '', // pour assignation après création
  });
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const classesRes = await api.get('/class');
        setClasses(classesRes.data.classes || []);

        // Si c'est une modification, charger les données du professeur
        if (id) {
          const teacherRes = await api.get(`/admin/teachers/${id}`);
          const teacher = teacherRes.data.teacher;
          setFormData({
            username: teacher.username || '',
            phone: teacher.phone || '',
            password: '', // Ne pas pré-remplir le mot de passe
            class: teacher.classes?.[0]?._id || '', // Prendre la première classe si disponible
          });
        }
      } catch (err) {
        console.error('Erreur chargement données', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement');
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (id) {
        // Mise à jour du professeur
        const updateData = {
          username: formData.username,
          phone: formData.phone,
        };
        
        // Ne mettre à jour le mot de passe que s'il est fourni
        if (formData.password) {
          updateData.password = formData.password;
        }

        await api.put(`/admin/teachers/${id}`, updateData);

        // Gérer l'assignation de classe si nécessaire
        if (formData.class) {
          await api.post('/admin/assign-teacher-to-class', {
            teacherId: id,
            classId: formData.class,
          });
        }
      } else {
        // Création d'un nouveau professeur
        if (!formData.password) {
          setError('Le mot de passe est requis pour créer un professeur');
          setLoading(false);
          return;
        }

        const res = await api.post('/admin/create-teacher', {
          username: formData.username,
          phone: formData.phone,
          password: formData.password,
        });
        const teacherId = res.data.teacher?.id || res.data.teacher?._id;

        // Assigner à une classe si choisie
        if (formData.class && teacherId) {
          await api.post('/admin/assign-teacher-to-class', {
            teacherId,
            classId: formData.class,
          });
        }
      }

      navigate('/admin/teachers');
    } catch (err) {
      setError(err.response?.data?.message || err.message || `Erreur lors de la ${id ? 'modification' : 'création'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{id ? 'Modifier' : 'Ajouter'} un professeur</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom d'utilisateur</label>
          <input type="text" name="username" value={formData.username} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label>Téléphone</label>
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label>Mot de passe {id ? '(laisser vide pour ne pas changer)' : '*'}</label>
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            required={!id} 
            minLength="6" 
            disabled={loading} 
          />
        </div>
        <div className="form-group">
          <label>Classe à assigner (optionnel)</label>
          <select name="class" value={formData.class} onChange={handleChange} disabled={loading}>
            <option value="">Ne pas assigner maintenant</option>
            {classes.map(cls => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'En cours...' : id ? 'Mettre à jour' : 'Créer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/teachers')} disabled={loading}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeacherForm;