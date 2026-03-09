// src/components/admin/ClassesList.jsx
import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../../context/LanguageContext';
// Header and Sidebar imports removed
import api from '../../services/api';
import { FiPlus, FiSearch, FiTrash2, FiEdit2, FiBook, FiUser } from 'react-icons/fi';
import { LuSchool } from 'react-icons/lu';
import '../../styles/Dashboard.css';
import '../../styles/Components.css'; // Shared component styles

const ClassesList = () => {
  const { t, language } = useContext(LanguageContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/class');
      setClasses(res.data.classes);
    } catch (err) {
      console.error('Error fetching classes', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_class'))) {
      try {
        await api.delete(`/class/${id}`);
        setClasses(classes.filter((c) => c._id !== id));
      } catch (err) {
        console.error('Error deleting class', err);
      }
    }
  };

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FiBook className="text-primary-600" />
            {t('classes_management')}
          </h1>
          <p className="page-subtitle">{classes.length} {t('registered_count')}</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={t('search_classes')}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Link to="/admin/classes/create" className="btn-add">
          <FiPlus size={20} />
          <span>{t('new_class')}</span>
        </Link>
      </div>

      <div className="cards-grid">
        {filteredClasses.length === 0 ? (
          <div className="empty-state">
            <LuSchool className="empty-icon" />
            <div className="empty-text">{t('no_items_found')}</div>
            <div className="empty-subtext">{t('add_first')}</div>
          </div>
        ) : (
          filteredClasses.map((cls) => (
            <div key={cls._id} className="item-card">
              <div className="card-header">
                <div className="item-badge primary">
                  {cls.name.charAt(0)}
                </div>
                <div className="item-actions">
                  <Link to={`/admin/classes/edit/${cls._id}`} className="btn-icon">
                    <FiEdit2 size={16} />
                  </Link>
                  <button onClick={() => handleDelete(cls._id)} className="btn-icon delete">
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="item-title">{cls.name}</div>
              <div className="item-subtitle">{language === 'ar' ? 'المستوى' : 'Niveau'}: {cls.level}</div>

              <div className="chips-container">
                <div className="chip">
                  <FiUser className="chip-icon" />
                  {cls.students?.length || 0} {t('students')}
                </div>
                {cls.teachers?.slice(0, 2).map(teacher => (
                  <div key={teacher._id} className="chip">
                    {teacher.username}
                  </div>
                ))}
                {cls.teachers?.length > 2 && (
                  <div className="chip more">+{cls.teachers.length - 2}</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default ClassesList;
