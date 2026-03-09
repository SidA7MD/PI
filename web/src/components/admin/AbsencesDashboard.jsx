// src/components/admin/AbsencesDashboard.jsx
import { useEffect, useState, useContext } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { LanguageContext } from '../../context/LanguageContext';

const AbsencesDashboard = () => {
  const { t, language } = useContext(LanguageContext);
  const [absences, setAbsences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const socket = useSocket();

  useEffect(() => {
    fetchAbsences();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('absence:deleted', (data) => {
        console.log('🗑️ Absence or student deleted, refreshing history...', data);
        fetchAbsences();
      });

      return () => {
        socket.off('absence:deleted');
      };
    }
  }, [socket]);

  const fetchAbsences = async () => {
    try {
      const res = await api.get('/absence');
      setAbsences(res.data.absences || []);
    } catch (err) {
      console.error('Erreur absences', err);
    } finally {
      setLoading(false);
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
          {t('loading_absences')}
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
        <div>
          <h1 style={{
            fontSize: isMobile ? '24px' : '28px',
            color: '#2d3748',
            margin: '0 0 6px 0',
            fontWeight: '600',
            letterSpacing: '-0.5px',
            textAlign: language === 'ar' ? 'right' : 'left'
          }}>
            {t('absences_history')}
          </h1>
          <p style={{
            color: '#718096',
            fontSize: '14px',
            margin: 0,
            fontWeight: '400',
            textAlign: language === 'ar' ? 'right' : 'left'
          }}>
            {t('tracking_absences')}
          </p>
        </div>
      </div>

      {isMobile ? (
        // Mobile Card View
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
        }}>
          {absences.length === 0 ? (
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
              {t('no_absences_recorded')}
            </div>
          ) : (
            absences.map(absence => (
              <div
                key={absence._id}
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
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2d3748',
                      margin: '0 0 4px 0',
                    }}>
                      {absence.student?.firstName} {absence.student?.lastName}
                    </h3>
                    <div style={{
                      fontSize: '13px',
                      color: '#718096',
                    }}>
                      {absence.class?.name || 'Inconnu'}
                    </div>
                  </div>
                  <span style={{
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'inline-block',
                    background: absence.justified ? '#c6f6d5' : '#fed7d7',
                    color: absence.justified ? '#22543d' : '#742a2a',
                    whiteSpace: 'nowrap',
                  }}>
                    {absence.justified ? t('justified_label') : t('not_justified_label')}
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid #f1f5f9',
                }}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
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
                        Date
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#2d3748',
                      }}>
                        {new Date(absence.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR')}
                      </div>
                    </div>

                    <div>
                      <div style={{
                        fontSize: '11px',
                        fontWeight: '600',
                        color: '#a0aec0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                      }}>
                        {language === 'ar' ? 'أستاذ' : 'Professeur'}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#2d3748',
                      }}>
                        {absence.teacher?.username || 'Inconnu'}
                      </div>
                    </div>
                  </div>

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
                  }}>{t('students')}</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>{language === 'ar' ? 'الفصل' : 'Classe'}</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>{language === 'ar' ? 'الأستاذ' : 'Professeur'}</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>Date</th>
                  <th style={{
                    padding: '16px 24px',
                    textAlign: 'left',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#a0aec0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}>{language === 'ar' ? 'الحالة' : 'Status'}</th>
                </tr>
              </thead>
              <tbody style={{ background: '#ffffff' }}>
                {absences.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{
                      textAlign: 'center',
                      padding: '64px 24px',
                      color: '#a0aec0',
                      fontSize: '14px',
                    }}>
                      {t('no_absences_recorded')}
                    </td>
                  </tr>
                ) : (
                  absences.map(absence => (
                    <tr
                      key={absence._id}
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
                        {absence.student?.firstName} {absence.student?.lastName}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        {absence.class?.name || 'Inconnu'}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        {absence.teacher?.username || 'Inconnu'}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        {new Date(absence.date).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'fr-FR')}
                      </td>
                      <td style={{
                        padding: '20px 24px',
                        borderBottom: '1px solid #f1f5f9',
                        fontSize: '14px',
                        color: '#2d3748',
                        verticalAlign: 'middle',
                      }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block',
                          background: absence.justified ? '#c6f6d5' : '#fed7d7',
                          color: absence.justified ? '#22543d' : '#742a2a',
                        }}>
                          {absence.justified ? t('justified_label') : t('not_justified_label')}
                        </span>
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

export default AbsencesDashboard;
