// src/components/admin/TeachersList.jsx
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
// Header and Sidebar imports removed
import api from '../../services/api';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { LuSchool } from 'react-icons/lu';
import '../../styles/Dashboard.css';
import '../../styles/Components.css';

const TeachersList = () => {
  const { t, language } = useContext(LanguageContext);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data.teachers);
    } catch (err) {
      console.error('Error fetching teachers', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_teacher'))) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        setTeachers(teachers.filter((t) => t._id !== id));
      } catch (err) {
        console.error('Error deleting teacher', err);
      }
    }
  };

  const filteredTeachers = teachers.filter(t =>
    t.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiUser className="text-primary-600" />
            {t('teachers_management')}
          </h1>
          <p className="page-subtitle">{teachers.length} {t('registered_count')}</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_teachers')}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link to="/admin/teachers/create" className="btn-add">
          <FiPlus size={20} />
          <span>{t('add_teacher')}</span>
        </Link>
      </div>

      <div className="cards-grid">
        {filteredTeachers.length === 0 ? (
          <div className="empty-state">
            <FiUser className="empty-icon" />
            <div className="empty-text">{t('no_items_found')}</div>
            <div className="empty-subtext">{t('add_first')}</div>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <div key={teacher._id} className="item-card">
              <div className="card-header">
                <div className="item-badge" style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  color: 'white'
                }}>
                  {teacher.username?.charAt(0)}
                </div>
                <div className="item-actions">
                  <Link to={`/admin/teachers/edit/${teacher._id}`} className="btn-icon">
                    <FiEdit2 size={16} />
                  </Link>
                  <button onClick={() => handleDelete(teacher._id)} className="btn-icon delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="item-title">{teacher.username}</div>
              <div className="item-subtitle">
                <FiMail size={14} /> {teacher.email}
              </div>

              <div className="chips-container">
                {teacher.phone && (
                  <div className="chip">
                    <FiPhone size={12} /> {teacher.phone}
                  </div>
                )}
                {teacher.classes?.map(cls => (
                  <div key={cls._id} className="chip">
                    📚 {cls.name}
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

export default TeachersList;
