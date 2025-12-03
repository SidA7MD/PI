// src/components/admin/StudentForm.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const StudentForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    class: '',
  });
  const [classes, setClasses] = useState([]);
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
        const classesRes = await api.get('/class');
        setClasses(classesRes.data.classes || []);

        if (id) {
          const studentRes = await api.get(`/student/${id}`);
          const student = studentRes.data.student;
          setFormData({
            firstName: student.firstName || '',
            lastName: student.lastName || '',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            class: student.class?._id || '',
          });
        }
      } catch (err) {
        console.error('Erreur chargement données', err);
      }
    };
    loadData();
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
        await api.put(`/student/${id}`, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          classId: formData.class || undefined,
        });
      } else {
        await api.post('/admin/create-student', {
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth || undefined,
          classId: formData.class || null,
        });
      }

      navigate('/admin/students');
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
    select: {
      width: '100%',
      padding: isMobile ? '14px 16px' : '12px 16px',
      fontSize: isMobile ? '16px' : '14px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      background: '#ffffff',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%232d3748\' d=\'M6 9L1 4h10z\'/%3E%3C/svg%3E")',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `right ${isMobile ? '16px' : '12px'} center`,
      paddingRight: isMobile ? '40px' : '36px',
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
          <h2 style={styles.title}>{id ? 'Modifier' : 'Ajouter'} un élève</h2>
        </div>
        {error && <div style={styles.errorMessage}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Prénom</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              placeholder="Entrez le prénom"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nom</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              disabled={loading}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              placeholder="Entrez le nom"
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Date de naissance (optionnel)</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              disabled={loading}
              style={styles.input}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Classe {id ? '(modifier l\'assignation)' : '(assignation après création)'}
            </label>
            <select
              name="class"
              value={formData.class}
              onChange={handleChange}
              disabled={loading}
              style={styles.select}
              onFocus={(e) => e.target.style.borderColor = '#4299e1'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
            >
              <option value="">
                {id ? 'Retirer de la classe' : 'Ne pas assigner maintenant'}
              </option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name}</option>
              ))}
            </select>
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
              onClick={() => navigate('/admin/students')}
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

export default StudentForm;
