// src/components/admin/ClassForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// Header and Sidebar imports removed
import api from '../../services/api';
import { 
  FiBook, FiSave, FiArrowLeft, FiAlertCircle, 
  FiUser, FiSearch, FiX 
} from 'react-icons/fi';
import { LuSchool } from 'react-icons/lu';
import '../../styles/Forms.css';
import '../../styles/Auth.css'; // For inputs

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', level: '', schoolYear: '', teachers: [] });
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const teachersRes = await api.get('/admin/teachers');
        setTeachers(teachersRes.data.teachers || []);

        if (id) {
          const cls = await api.get(`/class/${id}`);
          setFormData({
            name: cls.data.class?.name || '',
            level: cls.data.class?.level || '',
            schoolYear: cls.data.class?.schoolYear || '',
            teachers: cls.data.class?.teachers?.map(t => String(t._id || t)) || [],
          });
        }
      } catch (err) {
        console.error('Erreur', err);
        setError('Erreur lors du chargement des données');
      }
    };
    loadData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleTeacher = (teacherId) => {
    setFormData(prev => {
      const current = prev.teachers || [];
      const strId = String(teacherId);
      if (current.includes(strId)) {
        return { ...prev, teachers: current.filter(id => id !== strId) };
      } else {
        return { ...prev, teachers: [...current, strId] };
      }
    });
    setSearchTerm(''); // Clear search after selection
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (id) {
        await api.put(`/class/${id}`, formData);
      } else {
        await api.post('/admin/create-class', formData);
      }
      navigate('/admin/classes');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const selectedTeachers = teachers.filter(t => formData.teachers.includes(String(t._id)));
  const availableTeachers = teachers.filter(t => 
    !formData.teachers.includes(String(t._id)) &&
    t.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="form-container">
        <div className="form-card">
          <div className="form-header">
            <div className="form-icon">
              <FiBook />
            </div>
            <h2 className="form-title">{id ? 'Modifier Classe' : 'Nouvelle Classe'}</h2>
            <p className="form-subtitle">
              {id ? 'Mettre à jour les informations' : 'Créer une nouvelle classe'}
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
              <h3 className="section-title"><LuSchool /> Informations</h3>
              
              <div className="form-group">
                <label className="form-label">Nom de la classe *</label>
                <div className="form-input-wrapper">
                  <FiBook className="form-input-icon" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Ex: CP A"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Niveau *</label>
                  <div className="form-input-wrapper">
                    <FiBook className="form-input-icon" />
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">Sélectionner</option>
                      <option value="Primaire">Primaire</option>
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Année Scolaire</label>
                  <div className="form-input-wrapper">
                    <FiBook className="form-input-icon" />
                    <input
                      type="text"
                      name="schoolYear"
                      value={formData.schoolYear}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: 2023-2024"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title"><FiUser /> Professeurs</h3>
              <div className="chips-input-container">
                {selectedTeachers.length > 0 && (
                  <div className="selected-chips">
                    {selectedTeachers.map(t => (
                      <div 
                        key={t._id} 
                        className="active-chip"
                        onClick={() => toggleTeacher(t._id)}
                      >
                        <span>{t.username}</span>
                        <FiX size={14} />
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="search-input-wrapper" style={{ border: 'none', padding: 0 }}>
                  <FiSearch className="search-icon" style={{ left: 0 }} />
                  <input
                    type="text"
                    placeholder="Rechercher un professeur..."
                    className="search-input"
                    style={{ paddingLeft: '28px', border: 'none', background: 'transparent' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="search-dropdown">
                    {availableTeachers.length === 0 ? (
                      <div className="dropdown-item" style={{ color: '#999', cursor: 'default' }}>
                        Aucun résultat
                      </div>
                    ) : (
                      availableTeachers.map(t => (
                        <div 
                          key={t._id} 
                          className="dropdown-item"
                          onClick={() => toggleTeacher(t._id)}
                        >
                          {t.username}
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
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={() => navigate('/admin/classes')}
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

export default ClassForm;
