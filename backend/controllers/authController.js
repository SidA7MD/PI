const jwt = require('jsonwebtoken');
const User = require('../models/User');
const School = require('../models/School');

// Fonction pour générer un token JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, phone, password, role } = req.body;

    // Vérifier que tous les champs sont présents
    if (!username || !phone || !password || !role) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier si l'utilisateur existe déjà
    const userExists = await User.findOne({ $or: [{ username }, { phone }] });
    if (userExists) {
      return res.status(400).json({ message: 'Utilisateur déjà existant' });
    }

    // Vérifier que le rôle est valide
    if (!['superadmin', 'school', 'teacher', 'parent'].includes(role)) {
      return res.status(400).json({ message: 'Rôle invalide' });
    }

    // Créer l'utilisateur
    const user = await User.create({
      username,
      phone,
      password,
      role,
    });

    // Générer le token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: {
        id: user._id,
        username: user.username,
        phone: user.phone,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};


// @desc    Connexion d'un utilisateur (superadmin avec username, school avec email)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Vérifier que tous les champs sont présents
    if (!password || (!email && !username)) {
      return res.status(400).json({ message: 'Email ou nom d\'utilisateur et mot de passe sont requis' });
    }

    // Rechercher l'utilisateur par email (pour les écoles) ou username (pour superadmin)
    let user;
    if (email) {
      // Login avec email pour les écoles
      user = await User.findOne({ email: email.toLowerCase(), role: 'school' }).select('+password');
    } else {
      // Login avec username pour superadmin
      user = await User.findOne({ username, role: 'superadmin' }).select('+password');
    }

    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Vérifier le mot de passe
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Générer le token
    const token = generateToken(user._id);

    // Préparer la réponse selon le rôle
    const userResponse = {
      id: user._id,
      role: user.role,
    };

    if (user.role === 'school') {
      userResponse.email = user.email;
      userResponse.school = user.school;
    } else if (user.role === 'superadmin') {
      userResponse.username = user.username;
    }

    res.status(200).json({
      message: 'Connexion réussie',
      user: userResponse,
      token,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir le profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('classes', 'name')
      .populate('students', 'firstName lastName uniqueCode')
      .populate('school', 'name');

    res.status(200).json({
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
