// src/components/admin/TeacherForm.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
// Header and Sidebar imports removed
import api from '../../services/api';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiArrowLeft, FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import '../../styles/Forms.css';
import '../../styles/Auth.css'; // For basic form inputs

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      const fetchTeacher = async () => {
        try {
          const res = await api.get(`/admin/teachers/${id}`);
          const teacher = res.data.teacher;
          setFormData({
            username: teacher.username || '',
            email: teacher.email || '',
            phone: teacher.phone || '',
            password: '',
          });
        } catch (err) {
          console.error('Error', err);
          setError(t('error_loading'));
        }
      };
      fetchTeacher();
    }
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) {
        const updateData = {
          username: formData.username,
          email: formData.email,
          phone: formData.phone
        };
        if (formData.password) updateData.password = formData.password;
        await api.put(`/admin/teachers/${id}`, updateData);
      } else {
        await api.post('/admin/create-teacher', formData);
      }
      navigate('/admin/teachers');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('confirm_delete_teacher'))) {
      setLoading(true);
      try {
        await api.delete(`/admin/teachers/${id}`);
        navigate('/admin/teachers');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
        setLoading(false);
      }
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
            <h2 className="form-title">{id ? t('edit_teacher') : t('new_teacher')}</h2>
            <p className="form-subtitle">
              {id ? (language === 'ar' ? 'تحديث المعلومات' : 'Mettre à jour les informations') : t('create_teacher_account')}
            </p>
          </div>

          {error && (
            <div className="error-alert">
              <FiAlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title"><FiUser /> {t('personal_info')}</h3>

              <div className="form-group">
                <label className="form-label">{t('username_label')} *</label>
                <div className="form-input-wrapper">
                  <FiUser className="form-input-icon" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: Jean Dupont"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">{t('email_label')}</label>
                  <div className="form-input-wrapper">
                    <FiMail className="form-input-icon" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="prof@ecole.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{t('phone_label')}</label>
                  <div className="form-input-wrapper">
                    <FiPhone className="form-input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: 36..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title"><FiLock /> {t('security_section')}</h3>
              <div className="form-group">
                <label className="form-label">
                  {t('password_label')} {id ? t('password_hint') : '*'}
                </label>
                <div className="form-input-wrapper">
                  <FiLock className="form-input-icon" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="••••••••"
                    required={!id}
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? t('saving') : <><FiSave /> {id ? t('save') : t('save')}</>}
              </button>
              {id && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <FiTrash2 /> {t('delete')}
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/admin/teachers')}
                style={{ flex: 1 }}
              >
                <FiArrowLeft /> {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TeacherForm;
