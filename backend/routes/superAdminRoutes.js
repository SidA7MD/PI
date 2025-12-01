const express = require('express');
const router = express.Router();
const { createSchool, getAllSchools } = require('../controllers/adminController');
const { protect, superAdminOnly } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification et le rôle superadmin
router.use(protect);
router.use(superAdminOnly);

// Gestion des écoles
router.post('/create-school', createSchool);
router.get('/schools', getAllSchools);

module.exports = router;

