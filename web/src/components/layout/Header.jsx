// src/components/layout/Header.jsx
import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../layout/Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/admin/dashboard" className="header-logo">
          <h1>Gestion des Absences</h1>
        </Link>
        <div className="header-user">
          <span className="user-info">
            {user?.username && (
              <>
                <span className="user-name">{user.username}</span>
                <span className="user-role">({user.role})</span>
              </>
            )}
          </span>
          <button onClick={handleLogout} className="logout-button">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

