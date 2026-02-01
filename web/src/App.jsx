// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
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
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherHistory from './pages/TeacherHistory';
import ParentDashboard from './pages/ParentDashboard';

import ParentAbsences from './pages/ParentAbsences';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
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
                <Layout>
                  <Profile />
                </Layout>
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
                <Layout>
                  <TeacherDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/attendance/:classId"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherAttendance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/history"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherHistory />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <ParentDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent/absences"
            element={
              <ProtectedRoute>
                <Layout>
                  <ParentAbsences />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeachersList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/teachers/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassesList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/classes/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ClassForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentsList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/create"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/students/edit/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/absences"
            element={
              <ProtectedRoute>
                <Layout>
                  <AbsencesDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;