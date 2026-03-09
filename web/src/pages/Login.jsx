// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiGlobe } from 'react-icons/fi';
import { LuGraduationCap } from 'react-icons/lu';
import { LanguageContext } from '../context/LanguageContext';
import '../styles/Auth.css';

const Login = () => {
  const { language, setLanguage, t } = useContext(LanguageContext);
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
      setError(err.response?.data?.message || t('invalid_credentials'));
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
          <h1 className="auth-title">{t('welcome_back')}</h1>
          <p className="auth-subtitle">{t('login_subtitle')}</p>
        </div>

        {error && (
          <div className="error-alert">
            <FiAlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">{t('email_label')}</label>
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
            <label className="form-label">{t('password_label')}</label>
            <div className="form-input-wrapper">
              <FiLock className="form-input-icon" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="********"
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('logging_in') : (
              <>
                <span>{t('login_button')}</span>
                <FiLogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="lang-toggle-btn"
            style={{ border: 'none', background: 'var(--gray-50)' }}
          >
            <FiGlobe />
            <span>{language === 'fr' ? 'العربية' : 'Français'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
