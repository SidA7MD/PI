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
      const absences = Object.entries(attendance)
        .filter(([_, status]) => status !== 'present')
        .map(([studentId, status]) => ({
          studentId,
          status: status === 'late' ? 'retard' : 'absent',
          date: new Date().toISOString(),
        }));

      await api.post('/teacher/mark-bulk-absence', {
        classId,
        absences
      });
      alert('Appel enregistré avec succès !');
      navigate('/teacher/dashboard');
    } catch (err) {
      alert('Erreur lors de l\'enregistrement');
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
        
        <button onClick={handleSubmit} className="btn-add" disabled={submitting}>
          <FiSave size={20} />
          <span>{submitting ? 'Enregistrement...' : 'Valider l\'appel'}</span>
        </button>
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
