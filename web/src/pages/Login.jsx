// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import { LuGraduationCap } from 'react-icons/lu';
import '../styles/Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-wrapper">
            <LuGraduationCap />
          </div>
          <h1 className="auth-title">Bon retour !</h1>
          <p className="auth-subtitle">Connectez-vous pour gérer votre établissement</p>
        </div>

        {error && (
          <div className="error-alert">
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="form-input-wrapper">
              <FiMail className="form-input-icon" />
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="votre@email.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="form-input-wrapper">
              <FiLock className="form-input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Votre mot de passe"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Connexion...' : (
              <>
                <span>Se connecter</span>
                <FiLogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          
          
        </div>
      </div>
    </div>
  );
};

export default Login;
