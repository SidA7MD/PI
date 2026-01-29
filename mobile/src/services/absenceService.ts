import api from './api';
import { Absence } from '../types';

export const getAbsenceDetails = async (absenceId: string): Promise<Absence> => {
    const { data } = await api.get(`/absence/${absenceId}`);
    return data.absence;
};

export const deleteAbsences = async (absenceIds: string[]): Promise<void> => {
    await Promise.all(absenceIds.map(id => api.delete(`/absence/${id}`)));
};
