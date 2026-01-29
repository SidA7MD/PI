// src/pages/TeacherAttendance.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { FaArrowLeft, FaCheck, FaTimes, FaClock, FaSave } from 'react-icons/fa';
import '../styles/TeacherAttendance.css';

const TeacherAttendance = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, classesRes] = await Promise.all([
          api.get(`/teacher/class/${classId}/students`),
          api.get('/teacher/classes')
        ]);
        
        setStudents(studentsRes.data.students.map(s => ({ ...s, status: 'présent' })));
        
        const currentClass = classesRes.data.classes.find(c => c._id === classId);
        if (currentClass) setClassName(currentClass.name);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setMessage({ type: 'error', text: 'Erreur lors du chargement des données.' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classId]);

  const handleStatusChange = (studentId, status) => {
    setStudents(prev => prev.map(s => 
      s._id === studentId ? { ...s, status } : s
    ));
  };

  const markAll = (status) => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post('/teacher/mark-bulk-absence', {
        classId,
        students: students.map(s => ({
          studentId: s._id,
          status: s.status
        }))
      });
      setMessage({ type: 'success', text: 'Appel enregistré avec succès !' });
      setTimeout(() => navigate('/teacher/dashboard'), 2000);
    } catch (err) {
      console.error('Error submitting attendance:', err);
      setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="loading">Chargement de la classe...</div>;

  return (
    <div className="teacher-attendance">
      <div className="attendance-header">
        <button className="btn-back" onClick={() => navigate(-1)}>
          <FaArrowLeft /> Retour
        </button>
        <div className="title-area">
          <h1>Appel : {className}</h1>
          <p>{students.length} élèves inscrits</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => markAll('présent')}>Tous Présents</button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="attendance-table-container">
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Élève</th>
              <th>Code Unique</th>
              <th className="actions-header">Statut</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student._id}>
                <td>
                  <div className="student-name">
                    <span className="avatar">{student.firstName[0]}{student.lastName[0]}</span>
                    {student.firstName} {student.lastName}
                  </div>
                </td>
                <td><code className="unique-code">{student.uniqueCode}</code></td>
                <td>
                  <div className="status-selector">
                    <button 
                      className={`status-btn present ${student.status === 'présent' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student._id, 'présent')}
                      title="Présent"
                    >
                      <FaCheck /> Présent
                    </button>
                    <button 
                      className={`status-btn absent ${student.status === 'absent' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student._id, 'absent')}
                      title="Absent"
                    >
                      <FaTimes /> Absent
                    </button>
                    <button 
                      className={`status-btn late ${student.status === 'retard' ? 'active' : ''}`}
                      onClick={() => handleStatusChange(student._id, 'retard')}
                      title="Retard"
                    >
                      <FaClock /> Retard
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="attendance-footer">
        <div className="summary">
          <span>{students.filter(s => s.status === 'présent').length} Présents</span>
          <span>{students.filter(s => s.status === 'absent').length} Absents</span>
          <span>{students.filter(s => s.status === 'retard').length} Retards</span>
        </div>
        <button 
          className="btn-submit" 
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? 'Enregistrement...' : <><FaSave /> Valider l'appel</>}
        </button>
      </div>
    </div>
  );
};

export default TeacherAttendance;
