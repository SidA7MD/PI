// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
// Header and SuperAdminSidebar imports removed
import api from '../services/api';
import { FaPlus } from 'react-icons/fa';
import { FiTrendingUp, FiMail, FiLock, FiAlertCircle, FiCalendar, FiMinus } from 'react-icons/fi';
import { LuSchool } from 'react-icons/lu';
import '../styles/Dashboard.css';
import '../styles/Components.css';
import '../styles/Forms.css';
import '../styles/Auth.css';

const SuperAdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const res = await api.get('/superadmin/schools');
      setSchools(res.data.schools || []);
    } catch (err) {
      console.error('Erreur lors du chargement des écoles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (!formData.name || !formData.email || !formData.password) {
      setError('Tous les champs sont requis');
      setSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/superadmin/create-school', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      // Reset form and refresh schools list
      setFormData({ name: '', email: '', password: '' });
      setShowForm(false);
      fetchSchools();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la création de l\'école');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (schoolId, schoolName) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'école "${schoolName}" ? Cette action supprimera TOUTES les données associées (classes, élèves, professeurs) et est irréversible.`)) {
      try {
        await api.delete(`/superadmin/schools/${schoolId}`);
        fetchSchools();
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression de l\'école');
      }
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading">Chargement...</div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LuSchool className="text-primary-600" />
            Super Administrateur
          </h1>
          <p className="page-subtitle">Gestion globale des établissements scolaires</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-value">{schools.length}</div>
            <div className="stat-icon info">
              <LuSchool />
            </div>
          </div>
          <div className="stat-label">Écoles Inscrites</div>
        </div>
      </div>

      <div className="filter-bar" style={{ justifyContent: 'space-between' }}>
        <h2 className="page-title" style={{ fontSize: '20px', margin: 0 }}>
          <FiTrendingUp /> Écoles ({schools.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-add"
        >
          {showForm ? <FiMinus /> : <FaPlus />}
          <span>{showForm ? 'Fermer le formulaire' : 'Nouvelle école'}</span>
        </button>
      </div>

      {showForm && (
        <div className="form-container" style={{ margin: '0 0 32px 0', maxWidth: '100%' }}>
          <div className="form-card">
            <div className="form-header">
              <div className="form-icon">
                <LuSchool />
              </div>
              <h2 className="form-title">Créer une nouvelle école</h2>
              <p className="form-subtitle">Ajouter un établissement à la plateforme</p>
            </div>

            {error && (
              <div className="error-alert">
                <FiAlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h3 className="section-title"><LuSchool /> Informations de l'établissement</h3>

                <div className="form-group">
                  <label className="form-label">Nom de l'école *</label>
                  <div className="form-input-wrapper">
                    <LuSchool className="form-input-icon" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: École Primaire Centrale"
                      required
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email administrateur *</label>
                    <div className="form-input-wrapper">
                      <FiMail className="form-input-icon" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="admin@ecole.fr"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Mot de passe *</label>
                    <div className="form-input-wrapper">
                      <FiLock className="form-input-icon" />
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Minimum 6 caractères"
                        required
                        minLength="6"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Création en cours...' : 'Créer l\'école'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', email: '', password: '' });
                    setError('');
                  }}
                  disabled={submitting}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="cards-grid">
        {schools.length === 0 ? (
          <div className="empty-state">
            <LuSchool className="empty-icon" />
            <div className="empty-text">Aucune école enregistrée</div>
            <div className="empty-subtext">Utilisez le bouton "Nouvelle école" pour commencer</div>
          </div>
        ) : (
          schools.map((school) => (
            <div key={school._id} className="item-card">
              <div className="card-header">
                <div className="item-badge primary">
                  {school.name.charAt(0)}
                </div>
                <div className="item-actions">
                  <button
                    onClick={() => handleDelete(school._id, school.name)}
                    className="action-btn delete"
                    title="Supprimer l'école"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#e53e3e',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <FiMinus size={18} />
                  </button>
                </div>
              </div>

              <div className="item-title">{school.name}</div>

              <div className="item-subtitle">
                <FiMail size={14} /> {school.email}
              </div>

              <div className="chips-container">
                <div className="chip">
                  <FiCalendar size={12} />
                  Inscrit le {new Date(school.createdAt).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default SuperAdminDashboard;

