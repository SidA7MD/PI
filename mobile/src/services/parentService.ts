import api from './api';
import { Student, Absence } from '../types';
import { AbsenceFilters } from '../types/absence.types';

export const getMyChildren = async (): Promise<Student[]> => {
    const { data } = await api.get('/parent/students');
    return data.students;
};

export const getChildAbsences = async (
    studentId: string,
    filters?: AbsenceFilters
): Promise<Absence[]> => {
    const { data } = await api.get(`/parent/student/${studentId}/absences`, {
        params: filters,
    });
    return data.absences;
};

// Obtenir les statistiques du tableau de bord parent
export const getParentStats = async () => {
  try {
    const response = await api.get('/parent/stats');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Obtenir tous les enfants du parent
export const getChildren = async () => {
  try {
    const response = await api.get('/parent/students');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Obtenir toutes les absences des enfants
export const getAbsences = async () => {
  try {
    const response = await api.get('/parent/absences');
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

// Obtenir les absences d'un enfant spécifique (new version, renamed to avoid conflict)
export const getSpecificChildAbsences = async (studentId: string) => {
  try {
    const response = await api.get(`/parent/absences/${studentId}`);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const validateCode = async (uniqueCode: string): Promise<Student> => {
    const { data } = await api.post('/parent/validate-code', { uniqueCode });
    return data.student;
};

export const linkChild = async (uniqueCode: string): Promise<Student> => {
    const { data } = await api.post('/parent/link-student', { uniqueCode });
    return data.student;
};

export const unlinkChild = async (studentId: string): Promise<void> => {
    await api.delete(`/parent/student/${studentId}`);
};

export const getChildDetails = async (studentId: string): Promise<Student> => {
    const { data } = await api.get(`/student/${studentId}`);
    return data.student;
};
