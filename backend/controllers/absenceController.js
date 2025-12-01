const Absence = require('../models/Absence');
const User = require('../models/User');

// @desc    Obtenir toutes les absences
// @route   GET /api/absence
// @access  Private/School
exports.getAllAbsences = async (req, res) => {
  try {
    const { startDate, endDate, status, classId, studentId } = req.query;
    const schoolUser = await User.findById(req.user._id);

    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    // Construire le filtre - filtrer par école
    // Récupérer toutes les classes de l'école
    const Class = require('../models/Class');
    const classes = await Class.find({ school: schoolUser.school }).select('_id');
    const classIds = classes.map(cls => cls._id.toString());

    if (classIds.length === 0) {
      return res.status(200).json({
        count: 0,
        absences: [],
      });
    }

    let filter = {
      class: { $in: classIds.map(id => require('mongoose').Types.ObjectId(id)) }
    };

    // Filtrer les absences par classes de l'école
    filter.class = { $in: classIds };

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    if (status) filter.status = status;
    if (classId) {
      // Vérifier que la classe appartient à l'école
      if (classIds.some(id => id.toString() === classId)) {
        filter.class = classId;
      } else {
        return res.status(403).json({ message: 'Cette classe n\'appartient pas à votre école' });
      }
    }
    if (studentId) {
      // Vérifier que l'élève appartient à l'école
      const Student = require('../models/Student');
      const student = await Student.findById(studentId);
      if (student && student.school.toString() === schoolUser.school.toString()) {
        filter.student = studentId;
      } else {
        return res.status(403).json({ message: 'Cet élève n\'appartient pas à votre école' });
      }
    }

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
// @access  Private/School ou Teacher (propriétaire)
exports.deleteAbsence = async (req, res) => {
  try {
    const absence = await Absence.findById(req.params.id)
      .populate('class', 'school');

    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }

    // Vérifier que l'utilisateur a le droit de supprimer
    if (req.user.role === 'teacher') {
      if (absence.teacher.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Vous ne pouvez supprimer que vos propres absences' });
      }
    } else if (req.user.role === 'school') {
      // Vérifier que l'absence appartient à l'école
      if (absence.class && absence.class.school.toString() !== req.user.school.toString()) {
        return res.status(403).json({ message: 'Cette absence n\'appartient pas à votre école' });
      }
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
// @access  Private/School
exports.getAbsenceStats = async (req, res) => {
  try {
    const { classId, studentId, startDate, endDate } = req.query;
    const schoolUser = await User.findById(req.user._id);

    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    // Récupérer toutes les classes de l'école
    const Class = require('../models/Class');
    const classes = await Class.find({ school: schoolUser.school }).select('_id');
    const classIds = classes.map(cls => cls._id.toString());

    let matchStage = {
      class: { $in: classIds.map(id => require('mongoose').Types.ObjectId(id)) }
    };

    if (classId) {
      // Vérifier que la classe appartient à l'école
      if (classIds.includes(classId)) {
        matchStage.class = require('mongoose').Types.ObjectId(classId);
      } else {
        return res.status(403).json({ message: 'Cette classe n\'appartient pas à votre école' });
      }
    }
    
    if (studentId) {
      // Vérifier que l'élève appartient à l'école
      const Student = require('../models/Student');
      const student = await Student.findById(studentId);
      if (student && student.school.toString() === schoolUser.school.toString()) {
        matchStage.student = require('mongoose').Types.ObjectId(studentId);
      } else {
        return res.status(403).json({ message: 'Cet élève n\'appartient pas à votre école' });
      }
    }

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
