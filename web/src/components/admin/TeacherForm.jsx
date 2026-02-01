// src/components/admin/TeacherForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Header and Sidebar imports removed
import api from '../../services/api';
import { FiUser, FiMail, FiPhone, FiLock, FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import '../../styles/Forms.css';
import '../../styles/Auth.css'; // For basic form inputs

const TeacherForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
          setError('Erreur lors du chargement');
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

  return (
    <>
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <FiUser />
            </div>
            <h2 className="form-title">{id ? 'Modifier Professeur' : 'Nouveau Professeur'}</h2>
            <p className="form-subtitle">
              {id ? 'Mettre à jour les informations' : 'Créer un compte enseignant'}
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
              <h3 className="section-title"><FiUser /> Informations Personnelles</h3>
              
              <div className="form-group">
                <label className="form-label">Nom d'utilisateur *</label>
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
                  <label className="form-label">Email</label>
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
                  <label className="form-label">Téléphone</label>
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
              <h3 className="section-title"><FiLock /> Sécurité</h3>
              <div className="form-group">
                <label className="form-label">
                  Mot de passe {id ? '(laisser vide pour ne pas changer)' : '*'}
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
                {loading ? 'Enregistrement...' : <><FiSave /> {id ? 'Mettre à jour' : 'Enregistrer'}</>}
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/admin/teachers')}
                style={{ flex: 1 }}
              >
                <FiArrowLeft /> Annuler
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default TeacherForm;
