const express = require('express');
const router = express.Router();
const {
  linkStudent,
  getMyStudents,
  getAbsences,
  getStudentAbsences,
  getParentStats,
} = require('../controllers/parentController');
const { protect, parentOnly } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et le rôle parent
router.use(protect);
router.use(parentOnly);

// Obtenir les statistiques du tableau de bord
router.get('/stats', getParentStats);

// Lier un élève
router.post('/link-student', linkStudent);

// Obtenir ses élèves
router.get('/students', getMyStudents);

// Obtenir toutes les absences de ses enfants
router.get('/absences', getAbsences);

// Obtenir les absences d'un enfant spécifique
router.get('/absences/:studentId', getStudentAbsences);

module.exports = router;
