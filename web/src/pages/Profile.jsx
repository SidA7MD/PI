// src/pages/Profile.jsx
import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
// Header and Sidebar imports removed
import api from '../services/api';
import { FiUser, FiMail, FiPhone, FiSave, FiAlertCircle } from 'react-icons/fi';
import '../styles/Forms.css'; // Reuse form styles

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/auth/profile', formData); // Assuming this endpoint logic exists or similar
      setIsEditing(false);
      alert('Profil mis à jour !');
    } catch (err) {
      console.error(err);
      alert('Erreur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <FiUser />
            </div>
            <h2 className="form-title">Mon Profil</h2>
            <p className="form-subtitle">Gérez vos informations personnelles</p>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">Rôle</label>
              <div className="chip active-chip" style={{ width: 'fit-content', textTransform: 'capitalize' }}>
                  {user?.role}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title"><FiUser /> Informations</h3>
              
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur</label>
                <div className="form-input-wrapper">
                  <FiUser className="form-input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="form-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <div className="form-input-wrapper">
                  <FiMail className="form-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                  <div className="form-group">
                  <label className="form-label">Nouveau mot de passe (optionnel)</label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="form-input"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Enregistrement...' : <><FiSave /> Enregistrer modifications</>}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    Annuler
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
                  Modifier mon profil
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Profile;
