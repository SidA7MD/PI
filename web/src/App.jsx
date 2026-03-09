// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { LanguageProvider } from './context/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import TeachersList from './components/admin/TeachersList';
import TeacherForm from './components/admin/TeacherForm';
import ClassesList from './components/admin/ClassesList';
import ClassForm from './components/admin/ClassForm';
import StudentsList from './components/admin/StudentsList';
import StudentForm from './components/admin/StudentForm';
import AbsencesDashboard from './components/admin/AbsencesDashboard';
// ReportCards import removed
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherHistory from './pages/TeacherHistory';

import Profile from './pages/Profile';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/dashboard"
                element={
                  <ProtectedRoute>
                    <SuperAdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/attendance/:classId"
                element={
                  <ProtectedRoute>
                    <TeacherAttendance />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/history"
                element={
                  <ProtectedRoute>
                    <TeacherHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/classes"
                element={
                  <ProtectedRoute>
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/teachers"
                element={
                  <ProtectedRoute>
                    <TeachersList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers/create"
                element={
                  <ProtectedRoute>
                    <TeacherForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/teachers/edit/:id"
                element={
                  <ProtectedRoute>
                    <TeacherForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes"
                element={
                  <ProtectedRoute>
                    <ClassesList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/create"
                element={
                  <ProtectedRoute>
                    <ClassForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/classes/edit/:id"
                element={
                  <ProtectedRoute>
                    <ClassForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute>
                    <StudentsList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/create"
                element={
                  <ProtectedRoute>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/edit/:id"
                element={
                  <ProtectedRoute>
                    <StudentForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/absences"
                element={
                  <ProtectedRoute>
                    <AbsencesDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Report cards route removed */}
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;