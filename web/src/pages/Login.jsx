// src/pages/Login.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('school'); // 'school' or 'superadmin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginType === 'school' ? email : username, password, loginType);
      
      // Redirect based on role will be handled by App.jsx
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Gestion des Absences</h1>
          <p>Connectez-vous à votre compte</p>
        </div>
        {error && <div className="error-message">{error}</div>}
        
        <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setLoginType('school')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: loginType === 'school' ? '#667eea' : '#e0e0e0',
              color: loginType === 'school' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: loginType === 'school' ? '600' : '400',
            }}
          >
            École
          </button>
          <button
            type="button"
            onClick={() => setLoginType('superadmin')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: loginType === 'superadmin' ? '#667eea' : '#e0e0e0',
              color: loginType === 'superadmin' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: loginType === 'superadmin' ? '600' : '400',
            }}
          >
            Super Admin
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {loginType === 'school' ? (
            <div className="form-group">
              <label htmlFor="email">Email de l'école</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ecole.fr"
                required
                disabled={loading}
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                required
                disabled={loading}
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Entrez votre mot de passe"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;