// src/components/admin/StudentsList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// Header and Sidebar imports removed
import api from '../../services/api';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiUser, FiCalendar, FiBook } from 'react-icons/fi';
import { LuSchool, LuGraduationCap } from 'react-icons/lu';
import '../../styles/Dashboard.css';
import '../../styles/Components.css';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/student');
      setStudents(res.data.students);
    } catch (err) {
      console.error('Error fetching students', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer cet élève ?')) {
      try {
        await api.delete(`/admin/students/${id}`);
        setStudents(students.filter((s) => s._id !== id));
      } catch (err) {
        console.error('Error deleting student', err);
      }
    }
  };

  const filteredStudents = students.filter(s => 
    s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.parent?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <LuGraduationCap className="text-primary-600" />
            Gestion des Élèves
          </h1>
          <p className="page-subtitle">{students.length} élèves inscrits</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Rechercher un élève..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link to="/admin/students/create" className="btn-add">
          <FiPlus size={20} />
          <span>Inscrire un élève</span>
        </Link>
      </div>

      <div className="cards-grid">
        {filteredStudents.length === 0 ? (
          <div className="empty-state">
            <LuGraduationCap className="empty-icon" />
            <div className="empty-text">Aucun élève trouvé</div>
            <div className="empty-subtext">Ajoutez de nouveaux élèves pour commencer</div>
          </div>
        ) : (
          filteredStudents.map((student) => (
            <div key={student._id} className="item-card">
              <div className="card-header">
                <div className="item-badge success">
                  {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                </div>
                <div className="item-actions">
                  <Link to={`/admin/students/edit/${student._id}`} className="btn-icon">
                    <FiEdit2 size={16} />
                  </Link>
                  <button onClick={() => handleDelete(student._id)} className="btn-icon delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="item-title">{student.firstName} {student.lastName}</div>
              <div className="item-subtitle">
                <FiUser size={14} /> Parent: {student.parent?.username || 'Aucun'}
              </div>

              <div className="chips-container">
                {student.uniqueCode && (
                  <div className="chip" style={{ background: 'var(--primary-50)', color: 'var(--primary-700)', fontWeight: '600' }}>
                    🔗 Code: {student.uniqueCode}
                  </div>
                )}
                <div className="chip">
                  <FiCalendar size={12} /> 
                  {student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'}
                </div>
                {student.classes?.map(cls => (
                  <div key={cls._id} className="chip">
                    <FiBook size={12} /> {cls.name}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default StudentsList;
