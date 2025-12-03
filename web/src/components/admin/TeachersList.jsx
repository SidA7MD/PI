// src/components/admin/TeachersList.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await api.get('/admin/teachers');
      setTeachers(res.data.teachers || []);
    } catch (err) {
      console.error('Erreur lors du chargement des professeurs', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTeacher = async (id) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce professeur ?')) {
      try {
        await api.delete(`/admin/teachers/${id}`);
        setTeachers(teachers.filter(t => t._id !== id));
      } catch (err) {
        alert('Erreur lors de la suppression: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        flex: 1,
        padding: isMobile ? '20px' : '32px',
        minHeight: 'calc(100vh - 70px)',
        maxWidth: '100%',
        margin: '0 auto',
        width: '100%',
      }}>
        <div style={{
          textAlign: 'center',
          padding: isMobile ? '60px 20px' : '80px',
          fontSize: '16px',
          color: '#718096',
          fontWeight: '500',
        }}>
          Chargement des professeurs...
        </div>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      padding: isMobile ? '20px' : '32px',
      minHeight: 'calc(100vh - 70px)',
      maxWidth: '100%',
      margin: '0 auto',
      width: '100%',
    }}>
      <div style={{
        marginBottom: isMobile ? '24px' : '32px',
        padding: 0,
        background: 'transparent',
      }}>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: isMobile ? '16px' : '0',
        }}>
          <div>
            <h1 style={{
              fontSize: isMobile ? '24px' : '28px',
              color: '#2d3748',
              margin: '0 0 6px 0',
              fontWeight: '600',
              letterSpacing: '-0.5px',
            }}>
              Professeurs
            </h1>
            <p style={{
              color: '#718096',
              fontSize: '14px',
              margin: 0,
              fontWeight: '400',
            }}>
              Gérer les professeurs de votre école
            </p>
          </div>
          <Link
            to="/admin/teachers/create"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: isMobile ? '14px 20px' : '12px 24px',
              background: '#4299e1',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(66, 153, 225, 0.3)',
              border: 'none',
              cursor: 'pointer',
              width: isMobile ? '100%' : 'auto',
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#3182ce';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(66, 153, 225, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4299e1';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(66, 153, 225, 0.3)';
            }}
          >
            + Ajouter un professeur
          </Link>
        </div>
      </div>

      {isMobile ? (
        // Mobile Card View
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {teachers.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: '12px',
              padding: '48px 24px',
              textAlign: 'center',
              color: '#a0aec0',
              fontSize: '14px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
              border: '1px solid #e2e8f0',
            }}>
              Aucun professeur trouvé
            </div>
          ) : (
            teachers.map(teacher => (
              <div
                key={teacher._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '16px',
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2d3748',
                      margin: '0 0 4px 0',
                    }}>
                      {teacher.username}
                    </h3>
                    <div style={{
                      fontSize: '13px',
                      color: '#718096',
                    }}>
                      {teacher.phone}
                    </div>
                  </div>
                  <Link
                    to={`/admin/teachers/edit/${teacher._id}`}
                    style={{
                      color: '#4299e1',
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      backgroundColor: '#f0f9ff',
                      border: '1px solid #bae6fd',
                    }}
                  >
                    Modifier
                  </Link>
                </div>

                <div style={{
                  display: 'grid',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#a0aec0',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                    }}>
                      Classes assignées
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#2d3748',
                    }}>
                      {teacher.classes?.map(c => c.name).join(', ') || 'Aucune'}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTeacher(teacher._id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #fed7d7',
                      color: '#f56565',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500',
                      padding: '10px 16px',
                      borderRadius: '6px',
                      transition: 'all 0.2s ease',
                      marginTop: '8px',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fff5f5';
                      e.target.style.color = '#c53030';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#f56565';
                    }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Desktop Table View
        <div style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          width: '100%',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}>
              <thead style={{
                background: '#f7fafc',
                borderBottom: '1px solid #e2e8f0',
              }}>
                <tr>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>Nom d'utilisateur</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>Téléphone</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>Classes assignées</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>Actions</th>
                </tr>
              </thead>
              <tbody style={{ background: '#ffffff' }}>
                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{
                      textAlign: 'center',
                      padding: '64px 24px',
                      color: '#a0aec0',
                      fontSize: '14px',
                    }}>
                      Aucun professeur trouvé
                    </td>
                  </tr>
                ) : (
                  teachers.map(teacher => (
                    <tr
                      key={teacher._id}
                      style={{
                        transition: 'background-color 0.15s ease',
                        cursor: 'default',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f7fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                    >
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                        fontWeight: '500',
                      }}>
                        {teacher.username}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        {teacher.phone}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        {teacher.classes?.map(c => c.name).join(', ') || 'Aucune'}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        <Link
                          to={`/admin/teachers/edit/${teacher._id}`}
                          style={{
                            color: '#4299e1',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            transition: 'color 0.2s ease',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            display: 'inline-block',
                            marginRight: '8px',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#2c5282';
                            e.target.style.backgroundColor = '#f0f9ff';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#4299e1';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => deleteTeacher(teacher._id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#f56565',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.color = '#c53030';
                            e.target.style.backgroundColor = '#fff5f5';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.color = '#f56565';
                            e.target.style.backgroundColor = 'transparent';
                          }}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersList;
