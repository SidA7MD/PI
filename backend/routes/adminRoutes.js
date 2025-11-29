const express = require('express');
const router = express.Router();
const {
  createSchool,
  createTeacher,
  createClass,
  createStudent,
  assignStudentToClass,
  assignTeacherToClass,
  getSchools,
  getTeachers,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et le rôle admin
router.use(protect);
router.use(adminOnly);

// Gestion des écoles
router.post('/create-school', createSchool);
router.get('/schools', getSchools);

// Gestion des professeurs
router.post('/create-teacher', createTeacher);
router.get('/teachers', getTeachers);

// Gestion des classes
router.post('/create-class', createClass);

// Gestion des élèves
router.post('/create-student', createStudent);

// Assignations
router.post('/assign-student-to-class', assignStudentToClass);
router.post('/assign-teacher-to-class', assignTeacherToClass);

module.exports = router;
