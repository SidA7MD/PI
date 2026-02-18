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

    // Vérifier si l'élève est déjà lié à CE parent
    if (student.parents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Vous avez déjà lié cet élève' });
    }

    // Lier l'élève au parent
    student.parents.push(req.user._id);

    // Synchroniser le téléphone du parent (ajouter s'il y en a déjà un)
    if (req.user.phone) {
      if (student.parentPhone) {
        student.parentPhone += ` / ${req.user.phone}`;
      } else {
        student.parentPhone = req.user.phone;
      }
    }

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

    // Filtrer les élèves qui pourraient avoir été supprimés
    const activeStudents = parent.students.filter(s => s !== null);

    res.status(200).json({
      count: activeStudents.length,
      students: activeStudents,
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

    // Filtrer les absences d'élèves supprimés (si non nettoyé par cascade)
    const validAbsences = absences.filter(abs => abs.student !== null);

    res.status(200).json({
      count: validAbsences.length,
      absences: validAbsences,
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

    // Filtrer les élèves supprimés
    const validStudents = parent.students.filter(s => s !== null);

    // Filtrer les absences d'élèves supprimés
    const validAbsencesAll = absences.filter(abs => abs.student !== null);

    // Statistiques des 7 derniers jours
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAbsences = validAbsencesAll.filter(
      abs => new Date(abs.date) >= sevenDaysAgo
    );

    // Statistiques par enfant
    const childrenStats = validStudents.map(student => {
      const studentAbsences = validAbsencesAll.filter(
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
      totalChildren: validStudents.length,
      totalAbsences: validAbsencesAll.length,
      recentAbsences: recentAbsences.length,
      children: childrenStats,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
