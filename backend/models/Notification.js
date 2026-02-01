const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    // Destinataire (Parent)
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Type de notification
    type: {
      type: String,
      enum: ['absence', 'late', 'info', 'alert'],
      required: true,
    },
    // Titre
    title: {
      type: String,
      required: true,
      trim: true,
    },
    // Message
    message: {
      type: String,
      required: true,
      trim: true,
    },
    // Données supplémentaires (ID de l'absence, etc.)
    data: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Lu ou non
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index pour récupérer rapidement les notifications d'un utilisateur
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
