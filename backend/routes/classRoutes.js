const express = require('express');
const router = express.Router();
const {
  getAllClasses,
  getClassById,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Obtenir toutes les classes
router.get('/', getAllClasses);

// Obtenir une classe par ID
router.get('/:id', getClassById);

// Mettre à jour une classe (Admin seulement)
router.put('/:id', authorize('admin'), updateClass);

// Supprimer une classe (Admin seulement)
router.delete('/:id', authorize('admin'), deleteClass);

module.exports = router;
