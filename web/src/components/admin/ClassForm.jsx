// src/components/admin/ClassForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const ClassForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', level: '', schoolYear: '', teachers: [] });
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleTeacherToggle = (teacherId) => {
    setFormData(prev => {
      const currentTeachers = prev.teachers || [];
      // Ensure strict string comparison
      const strId = String(teacherId);
      const exists = currentTeachers.some(id => String(id) === strId);
      
      if (exists) {
        return { ...prev, teachers: currentTeachers.filter(id => String(id) !== strId) };
      } else {
        return { ...prev, teachers: [...currentTeachers, strId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting ClassForm:', formData);
    setLoading(true);
    try {
      setError('');
      if (id) {
        await api.put(`/class/${id}`, formData);
      } else {
        await api.post('/admin/create-class', formData);
      }
      navigate('/admin/classes');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'opération');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      padding: isMobile ? '20px' : '32px',
      maxWidth: '700px',
      margin: '0 auto',
      minHeight: 'calc(100vh - 70px)',
    },
    card: {
      background: '#ffffff',
      borderRadius: isMobile ? '16px' : '12px',
      padding: isMobile ? '24px' : '32px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
      border: '1px solid #e2e8f0',
    },
    header: {
      marginBottom: isMobile ? '24px' : '32px',
    },
    title: {
      fontSize: isMobile ? '20px' : '24px',
      color: '#2d3748',
      fontWeight: '600',
      margin: 0,
      letterSpacing: '-0.3px',
    },
    errorMessage: {
      background: '#fed7d7',
      color: '#742a2a',
      padding: isMobile ? '10px 14px' : '12px 16px',
      borderRadius: '8px',
      marginBottom: isMobile ? '20px' : '24px',
      fontSize: isMobile ? '13px' : '14px',
      border: '1px solid #fc8181',
      lineHeight: '1.5',
    },
    formGroup: {
      marginBottom: isMobile ? '20px' : '24px',
    },
    label: {
      display: 'block',
      fontSize: isMobile ? '13px' : '14px',
      fontWeight: '600',
      color: '#2d3748',
      marginBottom: '8px',
      lineHeight: '1.4',
    },
    input: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '12px 16px',
      fontSize: isMobile ? '16px' : '14px', // 16px prevents zoom on iOS
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      WebkitAppearance: 'none', // Better iOS styling
      MozAppearance: 'none',
    },
    formActions: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '12px' : '12px',
      marginTop: isMobile ? '28px' : '32px',
    },
    btnPrimary: {
      padding: isMobile ? '14px 24px' : '12px 24px',
      background: '#4299e1',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: isMobile ? '15px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: '0 2px 8px rgba(66, 153, 225, 0.3)',
      width: isMobile ? '100%' : 'auto',
      order: isMobile ? 1 : 1,
    },
    btnSecondary: {
      padding: isMobile ? '14px 24px' : '12px 24px',
      background: '#ffffff',
      color: '#2d3748',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: isMobile ? '15px' : '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      width: isMobile ? '100%' : 'auto',
      order: isMobile ? 2 : 2,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={styles.title}>{id ? 'Modifier' : 'Créer'} une classe</h2>
        </div>
        {error && <div style={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom de la classe</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              placeholder="Ex: CP-A, 6ème B..."
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Niveau (optionnel)</label>
            <input
              type="text"
              name="level"
              value={formData.level}
              onChange={handleChange}
              placeholder="Ex: CP, CE1, 6ème..."
              disabled={loading}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Année scolaire (optionnel)</label>
            <input
              type="text"
              name="schoolYear"
              value={formData.schoolYear}
              onChange={handleChange}
              placeholder="Ex: 2024-2025"
              disabled={loading}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={{ marginBottom: isMobile ? '20px' : '24px', width: '100%' }}>
            <label style={styles.label}>Professeurs assignés</label>
            <div style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '12px',
              maxHeight: '200px',
              overflowY: 'auto',
              background: '#f8fafc'
            }}>
              {teachers.length === 0 ? (
                 <p style={{ color: '#718096', fontSize: '14px', margin: 0 }}>Aucun professeur disponible</p>
              ) : (
                teachers.map(t => (
                  <label key={t._id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px 0'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.teachers && formData.teachers.some(id => String(id) === String(t._id))}
                      onChange={() => handleTeacherToggle(t._id)}
                      style={{ marginRight: '10px', width: '16px', height: '16px' }}
                    />
                    <span>{t.username}</span>
                  </label>
                ))
              )}
            </div>
          </div>
          <div style={styles.formActions}>
            <button
              type="submit"
              style={styles.btnPrimary}
              disabled={loading}
              onMouseEnter={(e) => !isMobile && (e.target.style.background = '#3182ce')}
              onMouseLeave={(e) => !isMobile && (e.target.style.background = '#4299e1')}
            >
              {loading ? 'En cours...' : id ? 'Mettre à jour' : 'Créer'}
            </button>
            <button
              type="button"
              style={styles.btnSecondary}
              onClick={() => navigate('/admin/classes')}
              disabled={loading}
              onMouseEnter={(e) => !isMobile && (e.target.style.background = '#f7fafc')}
              onMouseLeave={(e) => !isMobile && (e.target.style.background = '#ffffff')}
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassForm;
