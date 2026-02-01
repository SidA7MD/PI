const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Le nom de l'école est requis"],
      trim: true,
    },
    // Liste des matières enseignées
    subjects: {
      type: [String],
      default: [
        'Mathématiques',
        'Français',
        'Arabe',
        'Anglais',
        'Education Islamique',
        'Histoire-Géo',
        'Sciences Naturelles',
        'Physique-Chimie',
        'Education Physique'
      ],
    },
    // Administrateurs de l'école
    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Professeurs de l'école
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Classes de l'école
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    // Adresse
    address: {
      type: String,
      trim: true,
    },
    // Téléphone
    phone: {
      type: String,
    },
    // Email (pour connexion)
    email: {
      type: String,
      required: [true, "L'email de l'école est requis"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('School', schoolSchema);
