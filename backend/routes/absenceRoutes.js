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

// Obtenir toutes les absences (Admin seulement)
router.get('/', authorize('admin'), getAllAbsences);

// Obtenir les statistiques d'absences (Admin seulement)
router.get('/stats', authorize('admin'), getAbsenceStats);

// Obtenir une absence par ID
router.get('/:id', getAbsenceById);

// Supprimer une absence (Admin ou Teacher propriétaire)
router.delete('/:id', authorize('admin', 'teacher'), deleteAbsence);

module.exports = router;
