const mongoose = require('mongoose');

const absenceSchema = new mongoose.Schema(
  {
    // Élève concerné
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    // Classe
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    // Professeur qui marque l'absence
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Date de l'absence
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    // Statut : absent, présent, retard
    status: {
      type: String,
      enum: ['absent', 'présent', 'retard'],
      required: true,
    },
    // Motif (optionnel)
    reason: {
      type: String,
      trim: true,
    },
    // Justifié ou non
    justified: {
      type: Boolean,
      default: false,
    },
    // Notes additionnelles
    notes: {
      type: String,
      trim: true,
    },
    // Notification envoyée au parent
    notificationSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour améliorer les performances des requêtes
absenceSchema.index({ student: 1, date: -1 });
absenceSchema.index({ class: 1, date: -1 });

module.exports = mongoose.model('Absence', absenceSchema);
