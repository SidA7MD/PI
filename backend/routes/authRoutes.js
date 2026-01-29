const express = require('express');
const router = express.Router();
const { 
  register,
  registerSchool,
  login, 
  getMe, 
  updateMe,
  logout 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/register-school', registerSchool);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/logout', protect, logout);

module.exports = router;