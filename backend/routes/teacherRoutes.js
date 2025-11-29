const express = require('express');
const router = express.Router();
const {
  getMyClasses,
  getClassStudents,
  markAbsence,
  getClassAbsences,
  updateAbsence,
} = require('../controllers/teacherController');
const { protect, teacherOnly } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et le rôle professeur
router.use(protect);
router.use(teacherOnly);

// Obtenir les classes du professeur
router.get('/classes', getMyClasses);

// Obtenir les élèves d'une classe
router.get('/class/:classId/students', getClassStudents);

// Marquer une absence
router.post('/mark-absence', markAbsence);

// Obtenir les absences d'une classe
router.get('/class/:classId/absences', getClassAbsences);

// Modifier une absence
router.put('/absence/:absenceId', updateAbsence);

module.exports = router;
