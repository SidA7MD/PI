// src/pages/TeacherAttendance.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Header and Sidebar imports removed
import api from '../services/api';
import { FiCheckCircle, FiXCircle, FiClock, FiSave, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import '../styles/Dashboard.css';
import '../styles/Components.css'; 

const TeacherAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [className, setClassName] = useState('');

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const res = await api.get(`/teacher/class/${classId}/students`);
        setStudents(res.data.students);
        setClassName(res.data.class.name);
        if (res.data.subjects && res.data.subjects.length > 0) {
          setSubjects(res.data.subjects);
          setSelectedSubject(res.data.subjects[0]);
        }
        
        // Initialize attendance state (default present)
        const initialAttendance = {};
        res.data.students.forEach(s => {
          initialAttendance[s._id] = 'present';
        });
        setAttendance(initialAttendance);
      } catch (err) {
        console.error('Error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchClassData();
  }, [classId]);

  const toggleStatus = (studentId) => {
    setAttendance(prev => {
      const current = prev[studentId];
      if (current === 'present') return { ...prev, [studentId]: 'absent' };
      if (current === 'absent') return { ...prev, [studentId]: 'late' };
      return { ...prev, [studentId]: 'present' };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'var(--success-bg)';
      case 'absent': return 'var(--danger-bg)';
      case 'late': return 'var(--warning-bg)';
      default: return 'var(--gray-100)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <FiCheckCircle color="var(--success)" />;
      case 'absent': return <FiXCircle color="var(--danger)" />;
      case 'late': return <FiClock color="var(--warning)" />;
      default: return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Présent';
      case 'absent': return 'Absent';
      case 'late': return 'Retard';
      default: return '';
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const studentStatuses = Object.entries(attendance)
        .filter(([_, status]) => status !== 'present')
        .map(([studentId, status]) => ({
          studentId,
          status: status === 'late' ? 'retard' : 'absent',
        }));

      // Even if empty, we might want to send it? The backend requires students array.
      // If no absences, we can send empty list?
      // Backend: "ClassId et liste d'élèves requis".
      // Let's send all non-present students.

      if (studentStatuses.length === 0) {
          if (!window.confirm("Tout le monde est présent ?")) {
              setSubmitting(false);
              return;
          }
      }

      await api.post('/teacher/mark-bulk-absence', {
        classId,
        students: studentStatuses, // Changed from absences to students
        subject: selectedSubject,
        startTime
      });
      alert('Appel enregistré avec succès !');
      navigate('/teacher/dashboard');
    } catch (err) {
      console.error(err);
      alert('Erreur lors de l\'enregistrement: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <button onClick={() => navigate('/teacher/dashboard')} className="btn-icon">
              <FiArrowLeft size={20} />
            </button>
            <h1 className="page-title" style={{ margin: 0 }}>Faire l'appel - {className}</h1>
          </div>
          <p className="page-subtitle">Touchez les élèves pour changer leur statut</p>
        </div>
        
      </div>

      <div className="selection-section" style={{ padding: '0 24px 24px 24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Matière</h3>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {subjects.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${selectedSubject === sub ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                  background: selectedSubject === sub ? 'var(--primary-600)' : 'white',
                  color: selectedSubject === sub ? 'white' : 'var(--gray-900)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>Heure de début</h3>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
              <button
                key={t}
                onClick={() => setStartTime(t)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: `1px solid ${startTime === t ? 'var(--primary-600)' : 'var(--gray-300)'}`,
                  background: startTime === t ? 'var(--primary-600)' : 'white',
                  color: startTime === t ? 'white' : 'var(--gray-900)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSubmit} className="btn-add" disabled={submitting} style={{ padding: '10px 24px', borderRadius: '12px' }}>
            <FiSave size={20} />
            <span>{submitting ? 'Enregistrement...' : 'Valider l\'appel'}</span>
          </button>
        </div>
      </div>

      <div className="cards-grid">
        {students.map((student) => {
          const status = attendance[student._id];
          return (
            <div 
              key={student._id} 
              className={`item-card attendance-card ${status}`}
              onClick={() => toggleStatus(student._id)}
              style={{ 
                cursor: 'pointer',
                borderColor: status === 'present' ? 'transparent' : getStatusColor(status),
                backgroundColor: status === 'present' ? 'white' : getStatusColor(status).replace('rgb', 'rgba').replace(')', ', 0.1)'), /* Fallback if hex/var used differently */
              }}
            >
              <div className="card-header">
                <div className="item-badge" style={{ background: 'var(--gray-100)' }}>
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div 
                   className="chip"
                   style={{ 
                     background: getStatusColor(status), 
                     color: status === 'present' ? 'var(--success)' : (status === 'absent' ? 'var(--danger)' : 'var(--warning)'),
                     fontWeight: '600'
                   }}
                >
                  {getStatusText(status)}
                </div>
              </div>
              
              <div className="item-title">{student.firstName} {student.lastName}</div>
              <div className="item-subtitle">{student.uniqueCode}</div>
              
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                 {getStatusIcon(status)}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default TeacherAttendance;
