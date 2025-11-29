const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la classe est requis'],
      trim: true,
    },
    // Liste des élèves
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    // Professeurs assignés à cette classe
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // École
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    // Niveau (optionnel)
    level: {
      type: String,
      trim: true,
    },
    // Année scolaire
    schoolYear: {
      type: String,
      default: () => {
        const now = new Date();
        const year = now.getFullYear();
        return `${year}-${year + 1}`;
      },
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

module.exports = mongoose.model('Class', classSchema);
