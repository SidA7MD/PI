const express = require('express');
const router = express.Router();
const {
  createTeacher,
  getTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  createClass,
  createStudent,
  assignStudentToClass,
  assignTeacherToClass,
} = require('../controllers/adminController');
const { protect, schoolOnly } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et le rôle school
router.use(protect);
router.use(schoolOnly);

// Gestion des professeurs
router.post('/create-teacher', createTeacher);
router.get('/teachers', getTeachers);
router.get('/teachers/:id', getTeacherById);
router.put('/teachers/:id', updateTeacher);
router.delete('/teachers/:id', deleteTeacher);

// Gestion des classes
router.post('/create-class', createClass);

// Gestion des élèves
router.post('/create-student', createStudent);

// Assignations
router.post('/assign-student-to-class', assignStudentToClass);
router.post('/assign-teacher-to-class', assignTeacherToClass);

module.exports = router;
