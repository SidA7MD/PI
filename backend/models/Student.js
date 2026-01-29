const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    // Code unique pour lier parent-élève
    uniqueCode: {
      type: String,
      required: true,
      unique: true,
    },
    // Classe de l'élève
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
    },
    // Parent lié
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // École
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    // Informations supplémentaires
    dateOfBirth: {
      type: Date,
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

module.exports = mongoose.model('Student', studentSchema);
