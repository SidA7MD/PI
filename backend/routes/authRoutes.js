const express = require('express');
const router = express.Router();
const { 
  register,
  registerSchool,
  login, 
  getMe, 
  updateMe,
  logout,
  uploadAvatar,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public routes
router.post('/register', register);
router.post('/register-school', registerSchool);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.put('/profile', protect, updateMe); // Alias for mobile app compatibility
router.post('/logout', protect, logout);
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);
router.post('/change-password', protect, changePassword);

module.exports = router;