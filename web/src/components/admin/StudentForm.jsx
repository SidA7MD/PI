// src/components/admin/StudentForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Header and Sidebar imports removed
import api from '../../services/api';
import {
  FiUser, FiCalendar, FiBook, FiSave, FiArrowLeft, FiAlertCircle,
  FiSearch, FiX, FiTrash2
} from 'react-icons/fi';
import { LuGraduationCap } from 'react-icons/lu';
import '../../styles/Forms.css';
import '../../styles/Auth.css';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    uniqueCode: '',
    classes: [],
  });
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const classesRes = await api.get('/class');
        setClasses(classesRes.data.classes || []);

        if (id) {
          const studentRes = await api.get(`/student/${id}`);
          const student = studentRes.data.student;
          setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            uniqueCode: student.uniqueCode || '',
            classes: student.classes?.map(c => String(c._id || c)) || [],
          });
        }
      } catch (err) {
        console.error('Erreur chargement données', err);
        setError('Erreur lors du chargement des données');
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleClass = (classId) => {
    setFormData(prev => {
      const current = prev.classes || [];
      const strId = String(classId);
      if (current.includes(strId)) {
        return { ...prev, classes: current.filter(id => id !== strId) };
      } else {
        return { ...prev, classes: [...current, strId] };
      }
    });
    setSearchTerm('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) {
        await api.put(`/student/${id}`, formData);
      } else {
        await api.post('/admin/create-student', formData);
      }
      navigate('/admin/students');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer cet élève ?')) {
      setLoading(true);
      try {
        await api.delete(`/student/${id}`);
        navigate('/admin/students');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
        setLoading(false);
      }
    }
  };

  const selectedClasses = classes.filter(c => formData.classes.includes(String(c._id)));
  const availableClasses = classes.filter(c =>
    !formData.classes.includes(String(c._id)) &&
    c.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <LuGraduationCap />
            </div>
            <h2 className="form-title">{id ? 'Modifier Élève' : 'Inscrire Élève'}</h2>
            <p className="form-subtitle">
              {id ? 'Mettre à jour le dossier' : 'Créer un nouveau profil élève'}
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

              {id && formData.uniqueCode && (
                <div style={{
                  background: 'var(--primary-50)',
                  border: '2px solid var(--primary-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🔗</span>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--primary-700)', marginBottom: '4px' }}>CODE DE LIAISON</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-900)', letterSpacing: '2px' }}>{formData.uniqueCode}</div>
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Prénom *</label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: Amadou"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Nom *</label>
                  <div className="form-input-wrapper">
                    <FiUser className="form-input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: Ba"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date de naissance</label>
                <div className="form-input-wrapper">
                  <FiCalendar className="form-input-icon" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title"><FiBook /> Classes</h3>
              <div className="chips-input-container">
                {selectedClasses.length > 0 && (
                  <div className="selected-chips">
                    {selectedClasses.map(c => (
                      <div
                        key={c._id}
                        className="active-chip"
                        onClick={() => toggleClass(c._id)}
                      >
                        <span>{c.name}</span>
                        <FiX size={14} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="search-input-wrapper" style={{ border: 'none', padding: 0 }}>
                  <FiSearch className="search-icon" style={{ left: 0 }} />
                  <input
                    type="text"
                    placeholder="Rechercher une classe..."
                    className="search-input"
                    style={{ paddingLeft: '28px', border: 'none', background: 'transparent' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="search-dropdown">
                    {availableClasses.length === 0 ? (
                      <div className="dropdown-item" style={{ color: '#999', cursor: 'default' }}>
                        Aucun résultat
                      </div>
                    ) : (
                      availableClasses.map(c => (
                        <div
                          key={c._id}
                          className="dropdown-item"
                          onClick={() => toggleClass(c._id)}
                        >
                          {c.name}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2 }}>
                {loading ? 'Enregistrement...' : <><FiSave /> {id ? 'Mettre à jour' : 'Enregistrer'}</>}
              </button>
              {id && (
                <button
                  type="button"
                  className="btn-danger"
                  onClick={handleDelete}
                  disabled={loading}
                  style={{ flex: 1 }}
                >
                  <FiTrash2 /> Supprimer
                </button>
              )}
              <button
                type="button"
                className="btn-secondary"
                onClick={() => navigate('/admin/students')}
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

export default StudentForm;
