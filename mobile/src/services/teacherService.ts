import api from './api';
import { Class, Student, Absence } from '../types';
import { MarkAbsenceData, AbsenceFilters } from '../types/absence.types';

export interface TeacherStats {
    totalClasses: number;
    totalStudents: number;
    todayStats: {
        absences: number;
        lates: number;
        presents: number;
    };
    weeklyStats: {
        absences: number;
        lates: number;
        attendanceRate: number;
    };
    classes: ClassWithStats[];
}

export interface ClassWithStats extends Class {
    studentCount: number;
    todayAbsences: number;
    todayLates: number;
}

export interface BulkAbsenceStudent {
    studentId: string;
    status: 'absent' | 'présent' | 'retard';
    reason?: string;
    notes?: string;
}

export interface BulkAbsenceRequest {
    classId: string;
    date?: Date;
    students: BulkAbsenceStudent[];
}

export const getTeacherStats = async (): Promise<TeacherStats> => {
    const { data } = await api.get('/teacher/stats');
    return data;
};

export const getMyClasses = async (): Promise<Class[]> => {
    const { data } = await api.get('/teacher/classes');
    return data.classes;
};

export const getClassStudents = async (classId: string): Promise<Student[]> => {
    const { data } = await api.get(`/teacher/class/${classId}/students`);
    return data.students;
};

export const markAbsence = async (absenceData: MarkAbsenceData): Promise<any> => {
    const { data } = await api.post('/teacher/mark-absence', absenceData);
    return data;
};

export const markBulkAbsence = async (request: BulkAbsenceRequest): Promise<any> => {
    const { data } = await api.post('/teacher/mark-bulk-absence', request);
    return data;
};

export const getClassAbsences = async (
    classId: string,
    filters?: AbsenceFilters
): Promise<Absence[]> => {
    const { data } = await api.get(`/teacher/class/${classId}/absences`, {
        params: filters,
    });
    return data.absences;
};

export const updateAbsence = async (
    absenceId: string,
    updates: Partial<Absence>
): Promise<Absence> => {
    const { data } = await api.put(`/teacher/absence/${absenceId}`, updates);
    return data.absence;
};

export const deleteAbsence = async (absenceId: string): Promise<void> => {
    await api.delete(`/absence/${absenceId}`);
};

export const getClassDetails = async (classId: string): Promise<Class> => {
    const { data } = await api.get(`/class/${classId}`);
    return data.class;
};
