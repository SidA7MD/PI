const express = require('express');
const router = express.Router();
const {
  getAllAbsences,
  getAbsenceById,
  deleteAbsence,
  getAbsenceStats,
} = require('../controllers/absenceController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes spécifiques avant routes paramétrées
// Obtenir les statistiques d'absences (School seulement)
router.get('/stats', authorize('school'), getAbsenceStats);

// Obtenir toutes les absences (School seulement)
router.get('/', authorize('school'), getAllAbsences);

// Obtenir une absence par ID
router.get('/:id', getAbsenceById);

// Supprimer une absence (School ou Teacher propriétaire)
router.delete('/:id', authorize('school', 'teacher'), deleteAbsence);

module.exports = router;
