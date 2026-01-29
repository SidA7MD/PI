export interface AbsenceFilters {
    startDate?: string;
    endDate?: string;
    status?: 'justified' | 'unjustified' | 'all';
    absenceType?: 'absent' | 'présent' | 'retard' | 'all';
    studentId?: string;
    classId?: string;
}

export interface MarkAbsenceData {
    absences: Array<{
        student: string;
        class: string;
        teacher: string;
        date: Date;
        absenceType: 'absent' | 'retard';
        status: 'justified' | 'unjustified';
        reason?: string;
        notes?: string;
    }>;
}

export interface AbsenceStats {
    total: number;
    justified: number;
    unjustified: number;
    lates: number;
    attendanceRate: number;
}

export interface GroupedAbsences {
    date: string;
    absences: import('./index').Absence[];
}
