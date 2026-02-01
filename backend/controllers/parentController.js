const User = require('../models/User');
const Student = require('../models/Student');
const Absence = require('../models/Absence');

// @desc    Lier un élève à un parent via code unique
// @route   POST /api/parent/link-student
// @access  Private/Parent
exports.linkStudent = async (req, res) => {
  try {
    const { uniqueCode } = req.body;

    if (!uniqueCode) {
      return res.status(400).json({ message: 'Le code unique est requis' });
    }

    // Trouver l'élève avec ce code
    const student = await Student.findOne({ uniqueCode });

    if (!student) {
      return res.status(404).json({ message: 'Code invalide, élève non trouvé' });
    }

    // Vérifier si l'élève est déjà lié à un parent
    if (student.parent) {
      return res.status(400).json({ message: 'Cet élève est déjà lié à un parent' });
    }

    // Lier l'élève au parent
    student.parent = req.user._id;
    await student.save();

    // Ajouter l'élève à la liste des enfants du parent
    const parent = await User.findById(req.user._id);
    if (!parent.students.includes(student._id)) {
      parent.students.push(student._id);
      await parent.save();
    }

    res.status(200).json({
      message: 'Élève lié avec succès',
      student: {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        uniqueCode: student.uniqueCode,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir tous les élèves du parent
// @route   GET /api/parent/students
// @access  Private/Parent
exports.getMyStudents = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate({
      path: 'students',
      populate: { path: 'classes', select: 'name level' },
    });

    res.status(200).json({
      count: parent.students.length,
      students: parent.students,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir l'historique des absences de tous les enfants
// @route   GET /api/parent/absences
// @access  Private/Parent
exports.getAbsences = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id);

    // Récupérer toutes les absences des enfants du parent
    const absences = await Absence.find({
      student: { $in: parent.students },
    })
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

// @desc    Obtenir les absences d'un élève spécifique
// @route   GET /api/parent/absences/:studentId
// @access  Private/Parent
exports.getStudentAbsences = async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent = await User.findById(req.user._id);

    // Vérifier que l'élève appartient bien au parent
    if (!parent.students.includes(studentId)) {
      return res.status(403).json({ message: 'Accès non autorisé à cet élève' });
    }

    const absences = await Absence.find({ student: studentId })
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

// @desc    Obtenir les statistiques du tableau de bord parent
// @route   GET /api/parent/stats
// @access  Private/Parent
exports.getParentStats = async (req, res) => {
  try {
    const parent = await User.findById(req.user._id).populate({
      path: 'students',
      populate: { path: 'classes', select: 'name level' },
    });

    // Récupérer toutes les absences des enfants
    const absences = await Absence.find({
      student: { $in: parent.students.map(s => s._id) },
    })
      .populate('student', 'firstName lastName')
      .populate('class', 'name')
      .sort({ date: -1 });

    // Statistiques des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentAbsences = absences.filter(
      abs => new Date(abs.date) >= sevenDaysAgo
    );

    // Statistiques par enfant
    const childrenStats = parent.students.map(student => {
      const studentAbsences = absences.filter(
        abs => abs.student._id.toString() === student._id.toString()
      );
      return {
        id: student._id,
        firstName: student.firstName,
        lastName: student.lastName,
        classes: student.classes,
        uniqueCode: student.uniqueCode,
        totalAbsences: studentAbsences.length,
        recentAbsences: studentAbsences.filter(
          abs => new Date(abs.date) >= sevenDaysAgo
        ).length,
      };
    });

    res.status(200).json({
      totalChildren: parent.students.length,
      totalAbsences: absences.length,
      recentAbsences: recentAbsences.length,
      children: childrenStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
