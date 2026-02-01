// src/pages/Register.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { LuSchool } from 'react-icons/lu';
import '../styles/Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { fetchUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    schoolName: '',
    schoolAddress: '',
    schoolPhone: '',
    schoolEmail: '',
    adminUsername: '',
    adminPhone: '',
    adminPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.adminPassword !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.adminPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);
    setError('');
    
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

      localStorage.setItem('token', response.data.token);
      await fetchUser();
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'école');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card large">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LuSchool />
          </div>
          <h1 className="auth-title">Créer une École</h1>
          <p className="auth-subtitle">Espace administrateur</p>
        </div>

        {error && (
          <div className="error-alert">
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <h3 className="form-section-title">🏫 Informations de l'École</h3>
          
          <div className="form-group">
            <label className="form-label">Nom de l'école *</label>
            <div className="form-input-wrapper">
              <LuSchool className="form-input-icon" />
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="form-input"
                placeholder="Ex: École Primaire Centrale"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email contact</label>
              <div className="form-input-wrapper">
                <FiMail className="form-input-icon" />
                <input
                  type="email"
                  name="schoolEmail"
                  value={formData.schoolEmail}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="contact@ecole.fr"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <div className="form-input-wrapper">
                <FiPhone className="form-input-icon" />
                <input
                  type="tel"
                  name="schoolPhone"
                  value={formData.schoolPhone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="0612345678"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Adresse</label>
            <div className="form-input-wrapper">
              <FiMapPin className="form-input-icon" />
              <input
                type="text"
                name="schoolAddress"
                value={formData.schoolAddress}
                onChange={handleChange}
                className="form-input"
                placeholder="Adresse complète"
              />
            </div>
          </div>

          <h3 className="form-section-title" style={{ marginTop: '16px' }}>👤 Administrateur</h3>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nom d'utilisateur *</label>
              <div className="form-input-wrapper">
                <FiUser className="form-input-icon" />
                <input
                  type="text"
                  name="adminUsername"
                  value={formData.adminUsername}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="admin.ecole"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Mobile admin *</label>
              <div className="form-input-wrapper">
                <FiPhone className="form-input-icon" />
                <input
                  type="tel"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Perso: 06..."
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Mot de passe *</label>
              <div className="form-input-wrapper">
                <FiLock className="form-input-icon" />
                <input
                  type="password"
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Min 6 car."
                  required
                  minLength={6}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirmer *</label>
              <div className="form-input-wrapper">
                <FiLock className="form-input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Répétez"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '24px' }}>
            {loading ? 'Création...' : (
              <>
                <span>Créer le compte</span>
                <FiCheckCircle size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Déjà inscrit ? 
            <Link to="/login" className="auth-link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
