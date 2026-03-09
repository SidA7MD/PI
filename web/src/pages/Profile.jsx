import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LanguageContext } from '../context/LanguageContext';
import api from '../services/api';
import { FiUser, FiMail, FiPhone, FiSave, FiAlertCircle } from 'react-icons/fi';
import '../styles/Forms.css'; // Reuse form styles

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const { t, language } = useContext(LanguageContext);
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
      alert(t('profile_updated'));
    } catch (err) {
      console.error(err);
      alert(language === 'ar' ? 'خطأ' : 'Erreur');
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
            <h2 className="form-title">{t('my_profile')}</h2>
            <p className="form-subtitle" style={{ textAlign: language === 'ar' ? 'right' : 'left' }}>
              {t('manage_personal_info')}
            </p>
          </div>

          <div className="form-section">
            <div className="form-group">
              <label className="form-label">{t('role_label')}</label>
              <div className="chip active-chip" style={{ width: 'fit-content', textTransform: 'capitalize' }}>
                {user?.role}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title"><FiUser /> {language === 'ar' ? 'المعلومات' : 'Informations'}</h3>

              <div className="form-group">
                <label className="form-label">{t('username_label')}</label>
                <div className="form-input-wrapper">
                  <FiUser className="form-input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="form-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('email_label')}</label>
                <div className="form-input-wrapper">
                  <FiMail className="form-input-icon" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-input"
                    disabled={!isEditing}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'كلمة مرور جديدة (اختياري)' : 'Nouveau mot de passe (optionnel)'}</label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
                    {loading ? t('saving') : <><FiSave /> {t('save_changes_btn')}</>}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                    {t('cancel')}
                  </button>
                </>
              ) : (
                <button type="button" className="btn-primary" onClick={() => setIsEditing(true)}>
                  {t('edit_profile_btn')}
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
