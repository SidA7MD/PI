// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Login.css';

const Register = () => {
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // School information
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    // Admin account information
    adminUsername: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.adminPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/register-school', {
        schoolName: formData.schoolName,
        schoolAddress: formData.schoolAddress || undefined,
        schoolPhone: formData.schoolPhone || undefined,
        schoolEmail: formData.schoolEmail || undefined,
        adminUsername: formData.adminUsername,
        adminPhone: formData.adminPhone,
        adminPassword: formData.adminPassword,
      });

      // Store token
      localStorage.setItem('token', response.data.token);
      
      // Fetch user data and redirect to dashboard
      await fetchUser();
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de l\'école';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" style={{ maxWidth: '600px' }}>
        <div className="login-header">
          <h1>Créer une École</h1>
          <p>Enregistrez votre école et créez votre compte administrateur</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#667eea', fontSize: '18px' }}>Informations de l'École</h3>
            <div className="form-group">
              <label htmlFor="schoolName">Nom de l'école *</label>
              <input
                id="schoolName"
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                placeholder="Ex: École Primaire Centrale"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="schoolAddress">Adresse</label>
              <input
                id="schoolAddress"
                type="text"
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleChange}
                placeholder="Adresse complète de l'école"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="schoolPhone">Téléphone de l'école</label>
              <input
                id="schoolPhone"
                type="tel"
                name="schoolPhone"
                value={formData.schoolPhone}
                onChange={handleChange}
                placeholder="Ex: 0612345678"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="schoolEmail">Email de l'école</label>
              <input
                id="schoolEmail"
                type="email"
                name="schoolEmail"
                value={formData.schoolEmail}
                onChange={handleChange}
                placeholder="contact@ecole.fr"
                disabled={loading}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ marginBottom: '15px', color: '#667eea', fontSize: '18px' }}>Compte Administrateur</h3>
            <div className="form-group">
              <label htmlFor="adminUsername">Nom d'utilisateur *</label>
              <input
                id="adminUsername"
                type="text"
                name="adminUsername"
                value={formData.adminUsername}
                onChange={handleChange}
                placeholder="Nom d'utilisateur pour se connecter"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="adminPhone">Téléphone *</label>
              <input
                id="adminPhone"
                type="tel"
                name="adminPhone"
                value={formData.adminPhone}
                onChange={handleChange}
                placeholder="Ex: 0612345678"
                required
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="adminPassword">Mot de passe *</label>
              <input
                id="adminPassword"
                type="password"
                name="adminPassword"
                value={formData.adminPassword}
                onChange={handleChange}
                placeholder="Minimum 6 caractères"
                required
                minLength="6"
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Création en cours...' : 'Créer l\'école et le compte'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Vous avez déjà un compte ?{' '}
              <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                Se connecter
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

