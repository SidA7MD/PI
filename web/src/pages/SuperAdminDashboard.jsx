// src/pages/SuperAdminDashboard.jsx
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/layout/Header';
import SuperAdminSidebar from '../components/layout/SuperAdminSidebar';
import api from '../services/api';
import { FaPlus } from 'react-icons/fa';
import '../styles/Dashboard.css';
import '../styles/AdminPages.css';

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

  if (loading) {
    return (
      <div className="admin-layout">
        <Header />
        <div className="admin-content">
          <SuperAdminSidebar />
          <main className="dashboard-main">
            <div className="loading">Chargement...</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-content">
        <SuperAdminSidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <h1>Super Administrateur</h1>
            <p className="dashboard-subtitle">Gestion des écoles</p>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={() => setShowForm(!showForm)}
              className="add-button"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <FaPlus />
              {showForm ? 'Annuler' : 'Créer une nouvelle école'}
            </button>
          </div>

          {showForm && (
            <div className="content-card" style={{ marginBottom: '30px' }}>
              <h2 style={{ marginBottom: '20px' }}>Créer une nouvelle école</h2>
              {error && <div className="error-message">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Nom de l'école *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: École Primaire Centrale"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Email de l'école *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@ecole.fr"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="form-group">
                  <label>Mot de passe *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 caractères"
                    required
                    minLength="6"
                    disabled={submitting}
                  />
                  <small style={{ color: '#666', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    Ce mot de passe sera utilisé par l'école pour se connecter
                  </small>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? 'Création...' : 'Créer l\'école'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
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
          )}

          <div className="content-card">
            <h2 style={{ marginBottom: '20px' }}>Écoles enregistrées ({schools.length})</h2>
            {schools.length === 0 ? (
              <div className="empty-state">
                <p>Aucune école enregistrée</p>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Email</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  {schools.map((school) => (
                    <tr key={school._id}>
                      <td>{school.name}</td>
                      <td>{school.email}</td>
                      <td>{new Date(school.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;

