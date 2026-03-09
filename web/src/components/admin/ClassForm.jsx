// src/components/admin/ClassForm.jsx
import { useEffect, useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
// Header and Sidebar imports removed
import api from '../../services/api';
import {
  FiBook, FiSave, FiArrowLeft, FiAlertCircle,
  FiUser, FiSearch, FiX, FiTrash2
} from 'react-icons/fi';
import { LuSchool } from 'react-icons/lu';
import '../../styles/Forms.css';
import '../../styles/Auth.css'; // For inputs

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useContext(LanguageContext);
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
            teachers: cls.data.class?.teachers?.map(tc => String(tc._id || tc)) || [],
          });
        }
      } catch (err) {
        console.error('Erreur', err);
        setError(t('error_loading'));
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

  const handleDelete = async () => {
    if (window.confirm(t('confirm_delete_class'))) {
      setLoading(true);
      try {
        await api.delete(`/class/${id}`);
        navigate('/admin/classes');
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
        setLoading(false);
      }
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
            <h2 className="form-title">{id ? t('edit_class') : t('new_class_form')}</h2>
            <p className="form-subtitle">
              {id ? (language === 'ar' ? 'تحديث المعلومات' : 'Mettre à jour les informations') : t('add_class')}
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
              <h3 className="section-title"><LuSchool /> {language === 'ar' ? 'معلومات' : 'Informations'}</h3>

              <div className="form-group">
                <label className="form-label">{language === 'ar' ? 'اسم الفصل' : 'Nom de la classe'} *</label>
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
                  <label className="form-label">{language === 'ar' ? 'المستوى' : 'Niveau'} *</label>
                  <div className="form-input-wrapper">
                    <FiBook className="form-input-icon" />
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="form-input"
                      required
                    >
                      <option value="">{language === 'ar' ? 'اختر' : 'Sélectionner'}</option>
                      <option value="Primaire">{language === 'ar' ? 'ابتدائي' : 'Primaire'}</option>
                      <option value="Collège">{language === 'ar' ? 'إعدادي' : 'Collège'}</option>
                      <option value="Lycée">{language === 'ar' ? 'ثانوي' : 'Lycée'}</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{language === 'ar' ? 'السنة الدراسية' : 'Année Scolaire'}</label>
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
              <h3 className="section-title"><FiUser /> {t('teachers')}</h3>
              <div className="chips-input-container">
                {selectedTeachers.length > 0 && (
                  <div className="selected-chips">
                    {selectedTeachers.map(teacher => (
                      <div
                        key={teacher._id}
                        className="active-chip"
                        onClick={() => toggleTeacher(teacher._id)}
                      >
                        <span>{teacher.username}</span>
                        <FiX size={14} />
                      </div>
                    ))}
                  </div>
                )}

                <div className="search-input-wrapper" style={{ border: 'none', padding: 0 }}>
                  <FiSearch className="search-icon" style={{ left: 0 }} />
                  <input
                    type="text"
                    placeholder={t('search_teachers')}
                    className="search-input"
                    style={{ paddingLeft: language === 'ar' ? 0 : '28px', paddingRight: language === 'ar' ? '28px' : 0, border: 'none', background: 'transparent' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {searchTerm && (
                  <div className="search-dropdown">
                    {availableTeachers.length === 0 ? (
                      <div className="dropdown-item" style={{ color: '#999', cursor: 'default' }}>
                        {language === 'ar' ? 'لا توجد نتائج' : 'Aucun résultat'}
                      </div>
                    ) : (
                      availableTeachers.map(teacher => (
                        <div
                          key={teacher._id}
                          className="dropdown-item"
                          onClick={() => toggleTeacher(teacher._id)}
                        >
                          {teacher.username}
                        </div>
                      ))
                    )}
                  </div>
                )}
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
                onClick={() => navigate('/admin/classes')}
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

export default ClassForm;
