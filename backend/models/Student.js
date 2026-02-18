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
    // Classes de l'élève (Many-to-Many)
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    // Parents liés (Many-to-Many)
    parents: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    // Téléphone du parent (synchronisé lors de la liaison)
    parentPhone: {
      type: String,
      trim: true,
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
