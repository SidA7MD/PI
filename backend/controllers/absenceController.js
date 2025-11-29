const Absence = require('../models/Absence');
const User = require('../models/User');

// @desc    Obtenir toutes les absences
// @route   GET /api/absence
// @access  Private/Admin
exports.getAllAbsences = async (req, res) => {
  try {
    const { startDate, endDate, status, classId, studentId } = req.query;

    // Construire le filtre
    let filter = {};

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (status) filter.status = status;
    if (classId) filter.class = classId;
    if (studentId) filter.student = studentId;

    const absences = await Absence.find(filter)
      .populate('student', 'firstName lastName')
      .populate('class', 'name')
      .populate('teacher', 'username')
      .sort({ date: -1 });

    res.status(200).json({
      count: absences.length,
      absences,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir une absence par ID
// @route   GET /api/absence/:id
// @access  Private
exports.getAbsenceById = async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id)
      .populate('student', 'firstName lastName uniqueCode')
      .populate('class', 'name level')
      .populate('teacher', 'username phone');

    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }

    res.status(200).json({
      absence,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer une absence
// @route   DELETE /api/absence/:id
// @access  Private/Admin ou Teacher (propriétaire)
exports.deleteAbsence = async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id);

    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }

    // Vérifier que l'utilisateur a le droit de supprimer
    if (req.user.role === 'teacher' && absence.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres absences' });
    }

    await absence.deleteOne();

    res.status(200).json({
      message: 'Absence supprimée avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir les statistiques d'absences
// @route   GET /api/absence/stats
// @access  Private/Admin
exports.getAbsenceStats = async (req, res) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;

    let matchStage = {};

    if (classId) matchStage.class = require('mongoose').Types.ObjectId(classId);
    if (studentId) matchStage.student = require('mongoose').Types.ObjectId(studentId);

    if (startDate || endDate) {
      matchStage.date = {};
      if (startDate) matchStage.date.$gte = new Date(startDate);
      if (endDate) matchStage.date.$lte = new Date(endDate);
    }

    const stats = await Absence.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      stats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
