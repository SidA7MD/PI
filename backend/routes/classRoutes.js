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

// Mettre à jour une classe (School seulement)
router.put('/:id', authorize('school'), updateClass);

// Supprimer une classe (School seulement)
router.delete('/:id', authorize('school'), deleteClass);

module.exports = router;
