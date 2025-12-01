// src/components/admin/ClassForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import '../../styles/AdminPages.css';

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', level: '', schoolYear: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const loadClass = async () => {
        try {
          const cls = await api.get(`/class/${id}`);
          setFormData({
            name: cls.data.class?.name || '',
            level: cls.data.class?.level || '',
            schoolYear: cls.data.class?.schoolYear || '',
          });
        } catch (err) {
          console.error('Erreur', err);
        }
      };
      loadClass();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError('');
      if (id) {
        await api.put(`/class/${id}`, formData);
      } else {
        await api.post('/admin/create-class', formData);
      }
      navigate('/admin/classes');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2>{id ? 'Modifier' : 'Créer'} une classe</h2>
      </div>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nom de la classe</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required disabled={loading} />
        </div>
        <div className="form-group">
          <label>Niveau (optionnel)</label>
          <input type="text" name="level" value={formData.level} onChange={handleChange} placeholder="Ex: CP, CE1, 6ème..." disabled={loading} />
        </div>
        <div className="form-group">
          <label>Année scolaire (optionnel)</label>
          <input type="text" name="schoolYear" value={formData.schoolYear} onChange={handleChange} placeholder="Ex: 2024-2025" disabled={loading} />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'En cours...' : id ? 'Mettre à jour' : 'Créer'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/admin/classes')} disabled={loading}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClassForm;