import { Student } from './index';

export interface StudentWithStats extends Student {
    attendanceRate: number;
    absencesThisMonth: number;
    absencesThisYear: number;
    latesThisMonth: number;
    latesThisYear: number;
    lastAbsenceDate?: Date;
    lastStatus: 'present' | 'absent' | 'late';
}

export interface StudentFilters {
    classId?: string;
    search?: string;
    active?: boolean;
}
