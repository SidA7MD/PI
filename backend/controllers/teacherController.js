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
    if (!student || !student.classes.some(c => c.toString() === classId.toString())) {
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

// @desc    Obtenir les statistiques du professeur pour le dashboard
// @route   GET /api/teacher/stats
// @access  Private/Teacher
exports.getTeacherStats = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate('classes');
    
    if (!teacher.classes || teacher.classes.length === 0) {
      return res.status(200).json({
        totalClasses: 0,
        totalStudents: 0,
        todayStats: { absences: 0, lates: 0, presents: 0 },
        weeklyStats: { absences: 0, lates: 0, attendanceRate: 100 },
        classes: [],
      });
    }

    const classIds = teacher.classes.map(c => c._id);
    
    // Count total students
    const totalStudents = await Student.countDocuments({ classes: { $in: classIds } });
    
    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayAbsences = await Absence.find({
      class: { $in: classIds },
      date: { $gte: today, $lt: tomorrow },
    });
    
    const todayStats = {
      absences: todayAbsences.filter(a => a.status === 'absent').length,
      lates: todayAbsences.filter(a => a.status === 'retard').length,
      presents: totalStudents - todayAbsences.filter(a => a.status !== 'présent').length,
    };
    
    // Weekly stats
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyAbsences = await Absence.find({
      class: { $in: classIds },
      date: { $gte: weekAgo, $lt: tomorrow },
    });
    
    const weeklyAbsenceCount = weeklyAbsences.filter(a => a.status === 'absent').length;
    const weeklyLateCount = weeklyAbsences.filter(a => a.status === 'retard').length;
    const totalPossibleAttendances = totalStudents * 7;
    const attendanceRate = totalPossibleAttendances > 0 
      ? Math.round(((totalPossibleAttendances - weeklyAbsenceCount) / totalPossibleAttendances) * 100) 
      : 100;
    
    // Classes with student counts
    const classesWithCounts = await Promise.all(
      teacher.classes.map(async (cls) => {
        const studentCount = await Student.countDocuments({ classes: cls._id });
        const todayClassAbsences = todayAbsences.filter(a => a.class.toString() === cls._id.toString());
        return {
          _id: cls._id,
          name: cls.name,
          level: cls.level,
          studentCount,
          todayAbsences: todayClassAbsences.filter(a => a.status === 'absent').length,
          todayLates: todayClassAbsences.filter(a => a.status === 'retard').length,
        };
      })
    );

    res.status(200).json({
      totalClasses: teacher.classes.length,
      totalStudents,
      todayStats,
      weeklyStats: {
        absences: weeklyAbsenceCount,
        lates: weeklyLateCount,
        attendanceRate,
      },
      classes: classesWithCounts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Marquer les absences en lot pour une classe
// @route   POST /api/teacher/mark-bulk-absence
// @access  Private/Teacher
exports.markBulkAbsence = async (req, res) => {
  try {
    const { classId, date, students } = req.body;
    // students: [{ studentId, status, reason?, notes? }, ...]
    
    if (!classId || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'ClassId et liste d\'élèves requis' });
    }

    const teacher = await User.findById(req.user._id);
    
    // Verify teacher teaches this class
    if (!teacher.classes.includes(classId)) {
      return res.status(403).json({ message: "Vous n'enseignez pas dans cette classe" });
    }

    const absenceDate = date ? new Date(date) : new Date();
    const results = { created: 0, skipped: 0, errors: [] };

    for (const studentData of students) {
      try {
        const { studentId, status, reason, notes } = studentData;
        
        if (!['absent', 'présent', 'retard'].includes(status)) {
          results.errors.push({ studentId, error: 'Statut invalide' });
          continue;
        }
        
        // Skip if present (no need to record)
        if (status === 'présent') {
          results.skipped++;
          continue;
        }

        // Check if absence already exists for this student on this date
        const startOfDay = new Date(absenceDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(absenceDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingAbsence = await Absence.findOne({
          student: studentId,
          class: classId,
          date: { $gte: startOfDay, $lte: endOfDay },
        });

        if (existingAbsence) {
          // Update existing
          existingAbsence.status = status;
          if (reason) existingAbsence.reason = reason;
          if (notes) existingAbsence.notes = notes;
          await existingAbsence.save();
          results.created++;
          continue;
        }

        // Create new absence
        const student = await Student.findById(studentId).populate('parent');
        
        const absence = await Absence.create({
          student: studentId,
          class: classId,
          teacher: req.user._id,
          status,
          reason,
          notes,
          date: absenceDate,
        });

        // Send notification
        if (student?.parent) {
          const message = `Votre enfant ${student.firstName} ${student.lastName} a été marqué comme ${status} le ${absenceDate.toLocaleDateString('fr-FR')}`;
          sendNotification(student.parent._id, message);
          absence.notificationSent = true;
          await absence.save();
        }

        results.created++;
      } catch (err) {
        results.errors.push({ studentId: studentData.studentId, error: err.message });
      }
    }

    res.status(201).json({
      message: `${results.created} absence(s) enregistrée(s), ${results.skipped} élève(s) présent(s)`,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
