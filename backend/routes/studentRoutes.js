const express = require('express');
const router = express.Router();
const {
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(protect);

// Obtenir tous les élèves (Admin seulement)
router.get('/', authorize('admin'), getAllStudents);

// Obtenir un élève par ID (Admin, Teacher, Parent)
router.get('/:id', authorize('admin', 'teacher', 'parent'), getStudentById);

// Mettre à jour un élève (Admin seulement)
router.put('/:id', authorize('admin'), updateStudent);

// Supprimer un élève (Admin seulement)
router.delete('/:id', authorize('admin'), deleteStudent);

module.exports = router;
