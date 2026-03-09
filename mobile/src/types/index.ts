export interface User {
  _id: string;
  username?: string;
  phone?: string;
  email?: string;
  role: 'teacher' | 'parent';
  classes?: string[];
  students?: string[];
  school: string;
  language?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  uniqueCode: string;
  class?: {
    _id: string;
    name: string;
    level: string;
  };
  parent?: {
    _id: string;
    username: string;
    phone: string;
  };
  school: string;
  dateOfBirth?: Date;
  active: boolean;
  photo?: string;
  lastStatus?: 'present' | 'absent' | 'late';
  absencesCount?: number;
  absencesThisMonth?: number;
  latesThisMonth?: number;
  attendanceRate?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Class {
  _id: string;
  name: string;
  level?: string;
  schoolYear: string;
  students: string[] | Student[];
  teachers: string[] | User[];
  school: string;
  active: boolean;
  absencesToday?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Absence {
  _id: string;
  student: string | Student;
  class: string | Class;
  teacher: string | User;
  date: Date;
  status: 'justified' | 'unjustified';
  absenceType: 'absent' | 'présent' | 'retard';
  reason?: string;
  notes?: string;
  duration?: number;
  notificationSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface School {
  _id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'absence' | 'late' | 'reminder';
  read: boolean;
  data?: any;
  createdAt: Date;
}
