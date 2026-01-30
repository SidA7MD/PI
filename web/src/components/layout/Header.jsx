// src/components/layout/Header.jsx
import { useContext } from 'react';
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

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/admin/dashboard" className="header-logo">
          <h1>khbarwilli</h1>
        </Link>
        <div className="header-user">
          {user?.username && (
            <Link to="/profile" className="user-info" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="user-avatar">
                {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="Avatar" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}} />
                ) : (
                    getInitials(user.username)
                )}
              </div>
              <div className="user-details">
                <span className="user-name">{user.username}</span>
                <span className="user-role">{user.role}</span>
              </div>
            </Link>
          )}
          <button onClick={handleLogout} className="logout-button">
            Déconnexion
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
