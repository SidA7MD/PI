const express = require('express');
const router = express.Router();
const { createSchool, getAllSchools, deleteSchool } = require('../controllers/adminController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et le rôle superadmin
router.use(protect);
router.use(superAdminOnly);

// Gestion des écoles
router.post('/create-school', createSchool);
router.get('/schools', getAllSchools);
router.delete('/schools/:id', deleteSchool);

module.exports = router;

