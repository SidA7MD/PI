// src/pages/Login.jsx
import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('school'); // 'school', 'teacher', or 'superadmin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password, loginType);

      // Redirect based on role will be handled by App.jsx
      navigate('/dashboard');
    } catch (err) {
      setError(typeof err === 'string' ? err : err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholder = () => {
    switch (loginType) {
      case 'school':
        return 'email@ecole.fr';
      case 'teacher':
        return 'Téléphone ou nom d\'utilisateur';
      case 'superadmin':
        return 'Nom d\'utilisateur';
      default:
        return 'Identifiant';
    }
  };

  const getLabel = () => {
    switch (loginType) {
      case 'school':
        return 'Email de l\'école';
      case 'teacher':
        return 'Téléphone ou nom d\'utilisateur';
      case 'superadmin':
        return 'Nom d\'utilisateur';
      default:
        return 'Identifiant';
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

        <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            onClick={() => setLoginType('teacher')}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: loginType === 'teacher' ? '#667eea' : '#e0e0e0',
              color: loginType === 'teacher' ? 'white' : '#333',
              cursor: 'pointer',
              fontWeight: loginType === 'teacher' ? '600' : '400',
            }}
          >
            Professeur
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
          <div className="form-group">
            <label htmlFor="identifier">{getLabel()}</label>
            <input
              id="identifier"
              type={loginType === 'school' ? 'email' : 'text'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={getPlaceholder()}
              required
              disabled={loading}
            />
          </div>
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

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Vous êtes une école ?{' '}
              <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                Créer un compte
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

