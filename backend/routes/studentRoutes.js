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

// Obtenir tous les élèves (School seulement)
router.get('/', authorize('school'), getAllStudents);

// Obtenir un élève par ID (School, Teacher, Parent)
router.get('/:id', authorize('school', 'teacher', 'parent'), getStudentById);

// Mettre à jour un élève (School seulement)
router.put('/:id', authorize('school'), updateStudent);

// Supprimer un élève (School seulement)
router.delete('/:id', authorize('school'), deleteStudent);

module.exports = router;
