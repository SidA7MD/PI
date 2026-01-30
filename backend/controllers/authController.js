const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// Email validation helper
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// @desc    Register a new school with admin account (Web only)
// @route   POST /api/auth/register-school
// @access  Public
exports.registerSchool = async (req, res) => {
  try {
    const { 
      schoolName, 
      schoolAddress, 
      schoolPhone, 
      schoolEmail,
      adminUsername,
      adminPhone,
      adminPassword 
    } = req.body;

    // Validation
    if (!schoolName || !adminUsername || !adminPhone || !adminPassword) {
      return res.status(400).json({ 
        message: 'Nom de l\'école, nom d\'utilisateur, téléphone et mot de passe sont requis' 
      });
    }

    if (adminPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Le mot de passe doit contenir au moins 6 caractères' 
      });
    }

    // Validate email format if provided
    if (schoolEmail && !isValidEmail(schoolEmail)) {
      return res.status(400).json({ message: 'Format d\'email invalide' });
    }

    // Check if school name already exists
    const schoolExists = await School.findOne({ name: schoolName });
    if (schoolExists) {
      return res.status(400).json({ message: 'Une école avec ce nom existe déjà' });
    }

    // Check if email already exists
    if (schoolEmail) {
      const emailExists = await User.findOne({ email: schoolEmail.toLowerCase() });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Check if username or phone already exists
    const userExists = await User.findOne({
      $or: [{ username: adminUsername }, { phone: adminPhone }]
    });
    if (userExists) {
      if (userExists.username === adminUsername) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur existe déjà' });
      }
      if (userExists.phone === adminPhone) {
        return res.status(400).json({ message: 'Ce numéro de téléphone existe déjà' });
      }
    }

    // Create the school
    const school = await School.create({
      name: schoolName,
      address: schoolAddress || undefined,
      phone: schoolPhone || undefined,
      email: schoolEmail ? schoolEmail.toLowerCase() : `${schoolName.toLowerCase().replace(/\s+/g, '')}@school.local`,
    });

    // Create the school admin user account
    const schoolUser = await User.create({
      username: adminUsername,
      phone: adminPhone,
      email: schoolEmail ? schoolEmail.toLowerCase() : undefined,
      password: adminPassword,
      role: 'school',
      school: school._id,
    });

    // Add admin to school's admins list
    school.admins.push(schoolUser._id);
    await school.save();

    // Generate token
    const token = generateToken(schoolUser._id);

    res.status(201).json({
      message: 'École créée avec succès',
      user: {
        _id: schoolUser._id,
        id: schoolUser._id,
        username: schoolUser.username,
        phone: schoolUser.phone,
        email: schoolUser.email,
        role: schoolUser.role,
        school: {
          _id: school._id,
          name: school.name,
        },
      },
      token,
    });
  } catch (error) {
    console.error('RegisterSchool error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Register a new user (Parent only on mobile, Teacher only on web)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, phone, email, password, role } = req.body;

    // Validation
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Username, password et role sont requis' });
    }

    // Parents must provide phone, teachers must provide email
    if (role === 'parent' && !phone) {
      return res.status(400).json({ message: 'Le téléphone est requis pour les parents' });
    }

    if (role === 'teacher' && !email) {
      return res.status(400).json({ message: 'L\'email est requis pour les professeurs' });
    }

    // Only allow parent and teacher roles
    if (!['teacher', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username },
        phone ? { phone } : null,
        email ? { email: email.toLowerCase() } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur existe déjà' });
      }
      if (existingUser.phone === phone) {
        return res.status(400).json({ message: 'Ce numéro de téléphone existe déjà' });
      }
      if (existingUser.email === email?.toLowerCase()) {
        return res.status(400).json({ message: 'Cet email existe déjà' });
      }
    }

    // Create user
    const userData = {
      username,
      password,
      role,
    };

    if (phone) userData.phone = phone;
    if (email) userData.email = email.toLowerCase();

    const user = await User.create(userData);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Compte créé avec succès',
      user: {
        _id: user._id,
        id: user._id, // Include both for compatibility
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Login user (supports phone, email, or username)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, username, phone, password } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({ message: 'Le mot de passe est requis' });
    }

    if (!email && !username && !phone) {
      return res.status(400).json({ 
        message: 'Email, téléphone ou nom d\'utilisateur requis' 
      });
    }

    // Build query to find user by email, phone, or username
    const query = {
      $or: [
        username ? { username } : null,
        phone ? { phone } : null,
        email ? { email: email.toLowerCase() } : null,
      ].filter(Boolean),
    };

    // Find user and include password field
    const user = await User.findOne(query)
      .select('+password')
      .populate('school', 'name')
      .populate('classes', 'name level')
      .populate('students', 'firstName lastName uniqueCode');

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Prepare user response (remove password)
    const userResponse = {
      _id: user._id,
      id: user._id, // Include both for compatibility
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      school: user.school,
      classes: user.classes,
      students: user.students,
    };

    res.status(200).json({
      message: 'Connexion réussie',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('school', 'name')
      .populate('classes', 'name level')
      .populate('students', 'firstName lastName uniqueCode');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
        school: user.school,
        classes: user.classes,
        students: user.students,
        pushToken: user.pushToken,
      },
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { username, phone, email, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // If updating password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Le mot de passe actuel est requis' 
        });
      }

      const isPasswordMatch = await user.comparePassword(currentPassword);
      if (!isPasswordMatch) {
        return res.status(401).json({ 
          message: 'Mot de passe actuel incorrect' 
        });
      }

      user.password = newPassword;
    }

    // Update other fields
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (email) user.email = email.toLowerCase();

    await user.save();

    res.status(200).json({
      message: 'Profil mis à jour avec succès',
      user: {
        _id: user._id,
        id: user._id,
        username: user.username,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('UpdateMe error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // Optionally clear push token
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { pushToken: null });
    }

    res.status(200).json({ message: 'Déconnexion réussie' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Upload user avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier téléchargé' });
    }

    // Construct the URL (assuming static file serving is set up)
    // In production this might be S3, but for local:
    const avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    user.avatarUrl = avatarUrl; // Assuming User model has avatarUrl field, if not it will be ignored until added
    await user.save();

    res.status(200).json({
      message: 'Avatar mis à jour',
      avatarUrl: avatarUrl
    });
  } catch (error) {
    console.error('Upload Avatar error:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Tous les champs sont requis' });
        }

        const user = await User.findById(req.user._id).select('+password');
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Mot de passe modifié avec succès' });
    } catch (error) {
        console.error('Change Password error:', error);
        res.status(500).json({ message: 'Erreur serveur', error: error.message });
    }
};