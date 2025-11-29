const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Absence = require('../models/Absence');

// Fonction mock pour envoyer une notification
function sendNotification(parentId, message) {
  console.log('📱 Notification envoyée →', parentId, message);
}

// @desc    Obtenir toutes les classes du professeur
// @route   GET /api/teacher/classes
// @access  Private/Teacher
exports.getMyClasses = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate({
      path: 'classes',
      populate: { path: 'students', select: 'firstName lastName uniqueCode' },
    });

    res.status(200).json({
      count: teacher.classes.length,
      classes: teacher.classes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir les élèves d'une classe
// @route   GET /api/teacher/class/:classId/students
// @access  Private/Teacher
exports.getClassStudents = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacher = await User.findById(req.user._id);

    // Vérifier que le professeur enseigne cette classe
    if (!teacher.classes.includes(classId)) {
      return res.status(403).json({ message: "Vous n'enseignez pas dans cette classe" });
    }

    const classObj = await Class.findById(classId).populate({
      path: 'students',
      populate: { path: 'parent', select: 'username phone' },
    });

    if (!classObj) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    res.status(200).json({
      class: {
        id: classObj._id,
        name: classObj.name,
        level: classObj.level,
      },
      count: classObj.students.length,
      students: classObj.students,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Marquer une absence
// @route   POST /api/teacher/mark-absence
// @access  Private/Teacher
exports.markAbsence = async (req, res) => {
  try {
    const { studentId, classId, status, reason, notes } = req.body;

    // Validation
    if (!studentId || !classId || !status) {
      return res.status(400).json({ message: "L'élève, la classe et le statut sont requis" });
    }

    if (!['absent', 'présent', 'retard'].includes(status)) {
      return res.status(400).json({ message: 'Statut invalide' });
    }

    const teacher = await User.findById(req.user._id);

    // Vérifier que le professeur enseigne cette classe
    if (!teacher.classes.includes(classId)) {
      return res.status(403).json({ message: "Vous n'enseignez pas dans cette classe" });
    }

    // Vérifier que l'élève appartient à cette classe
    const student = await Student.findById(studentId).populate('parent');
    if (!student || student.class.toString() !== classId) {
      return res.status(404).json({ message: 'Élève non trouvé dans cette classe' });
    }

    // Créer l'absence
    const absence = await Absence.create({
      student: studentId,
      class: classId,
      teacher: req.user._id,
      status,
      reason,
      notes,
      date: new Date(),
    });

    // Envoyer une notification au parent si l'élève est absent ou en retard
    if ((status === 'absent' || status === 'retard') && student.parent) {
      const message = `Votre enfant ${student.firstName} ${
        student.lastName
      } a été marqué comme ${status} le ${new Date().toLocaleDateString('fr-FR')}`;
      sendNotification(student.parent._id, message);

      // Marquer la notification comme envoyée
      absence.notificationSent = true;
      await absence.save();
    }

    const populatedAbsence = await Absence.findById(absence._id)
      .populate('student', 'firstName lastName')
      .populate('class', 'name')
      .populate('teacher', 'username');

    res.status(201).json({
      message: 'Absence enregistrée avec succès',
      absence: populatedAbsence,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir l'historique des absences d'une classe
// @route   GET /api/teacher/class/:classId/absences
// @access  Private/Teacher
exports.getClassAbsences = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacher = await User.findById(req.user._id);

    // Vérifier que le professeur enseigne cette classe
    if (!teacher.classes.includes(classId)) {
      return res.status(403).json({ message: "Vous n'enseignez pas dans cette classe" });
    }

    const absences = await Absence.find({ class: classId })
      .populate('student', 'firstName lastName')
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

// @desc    Modifier une absence
// @route   PUT /api/teacher/absence/:absenceId
// @access  Private/Teacher
exports.updateAbsence = async (req, res) => {
  try {
    const { absenceId } = req.params;
    const { status, reason, notes, justified } = req.body;

    const absence = await Absence.findById(absenceId);

    if (!absence) {
      return res.status(404).json({ message: 'Absence non trouvée' });
    }

    // Vérifier que le professeur a créé cette absence
    if (absence.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Vous ne pouvez modifier que vos propres absences' });
    }

    // Mettre à jour les champs
    if (status) absence.status = status;
    if (reason) absence.reason = reason;
    if (notes) absence.notes = notes;
    if (justified !== undefined) absence.justified = justified;

    await absence.save();

    const updatedAbsence = await Absence.findById(absenceId)
      .populate('student', 'firstName lastName')
      .populate('class', 'name')
      .populate('teacher', 'username');

    res.status(200).json({
      message: 'Absence mise à jour avec succès',
      absence: updatedAbsence,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
