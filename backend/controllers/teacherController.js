const User = require('../models/User');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Absence = require('../models/Absence');
const School = require('../models/School');

const Notification = require('../models/Notification');
const socketHandler = require('../utils/socketHandler');
const pushHandler = require('../utils/pushNotificationHandler');
const translationService = require('../services/translationService');

// Helper pour envoyer une notification (Socket.io + DB + Push)
async function sendAbsenceNotification(parentId, student, status, date, subject, startTime) {
  try {
    const parentUser = await User.findById(parentId);
    const lang = parentUser?.language || 'fr';

    const formattedDate = new Date(date).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'fr-FR');

    const parts = translationService.getParts(lang, subject, startTime);

    const titleKey = status === 'absent' ? 'absence_title' : 'late_title';
    const bodyKey = status === 'absent' ? 'absence_body' : 'late_body';

    const title = translationService.t(lang, titleKey);
    const message = translationService.t(lang, bodyKey, {
      firstName: student.firstName,
      lastName: student.lastName,
      subject: parts.subject,
      startTime: parts.startTime,
      date: formattedDate
    });

    const type = status === 'absent' ? 'absence' : 'late';

    // 1. Créer la notification en base
    const notification = await Notification.create({
      recipient: parentId,
      type,
      title,
      message,
      data: {
        studentId: student._id,
        date,
        subject,
        startTime
      }
    });

    console.log(`🔔 Created notification ${notification._id} for parent ${parentId}`);

    // 2. Envoyer en temps réel via Socket.io
    socketHandler.emitAbsenceNotification(parentId, notification);

    // 3. Envoyer une notification Push (Expo)
    if (parentUser && parentUser.pushToken) {
      console.log(`📱 Sending Push Notification to ${parentUser.username} in ${lang}`);
      await pushHandler.sendPushToUser(parentUser, title, message, {
        notificationId: notification._id,
        studentId: student._id,
        type
      });
    } else {
      console.log(`ℹ️ No push token for parent ${parentId}`);
    }

    return true;
  } catch (error) {
    console.error('Erreur envoi notification:', error);
    return false;
  }
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
      populate: { path: 'parents', select: 'username phone' },
    });

    if (!classObj) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    const school = await School.findById(teacher.school);
    const subjects = school ? school.subjects : [];

    res.status(200).json({
      class: {
        id: classObj._id,
        name: classObj.name,
        level: classObj.level,
      },
      count: classObj.students.length,
      students: classObj.students,
      subjects,
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
    const student = await Student.findById(studentId).populate('parents');
    if (!student || !student.classes.some(c => c.toString() === classId.toString())) {
      return res.status(404).json({ message: 'Élève non trouvé dans cette classe' });
    }

    // Créer l'absence
    const absence = await Absence.create({
      student: studentId,
      class: classId,
      teacher: req.user._id,
      absenceType: status,
      status: 'unjustified',
      reason,
      notes,
      date: new Date(),
    });

    // Envoyer une notification aux parents si l'élève est absent ou en retard
    if ((status === 'absent' || status === 'retard') && student.parents && student.parents.length > 0) {
      const message = `Votre enfant ${student.firstName} ${student.lastName
        } a été marqué comme ${status} le ${new Date().toLocaleDateString('fr-FR')}`;

      // Notifier chaque parent
      for (const parent of student.parents) {
        sendNotification(parent._id, message);
      }

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
      absences: todayAbsences.filter(a => a.absenceType === 'absent').length,
      lates: todayAbsences.filter(a => a.absenceType === 'retard').length,
      presents: totalStudents - todayAbsences.length, // Assuming only non-presents are stored
    };

    // Weekly stats
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyAbsences = await Absence.find({
      class: { $in: classIds },
      date: { $gte: weekAgo, $lt: tomorrow },
    });

    const weeklyAbsenceCount = weeklyAbsences.filter(a => a.absenceType === 'absent').length;
    const weeklyLateCount = weeklyAbsences.filter(a => a.absenceType === 'retard').length;
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
          todayAbsences: todayClassAbsences.filter(a => a.absenceType === 'absent').length,
          todayLates: todayClassAbsences.filter(a => a.absenceType === 'retard').length,
        };
      })
    );

    console.log('🔎 Finding school for teacher:', req.user._id);
    const school = await School.findById(teacher.school);
    console.log('🏫 School found:', school ? school.name : 'None');
    const subjects = school ? school.subjects : [];

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
      subjects,
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
    const { classId, date, students, subject, startTime } = req.body;
    // students: [{ studentId, status, reason?, notes? }, ...]

    if (!classId || !students || !Array.isArray(students)) {
      return res.status(400).json({ message: 'ClassId et liste d\'élèves requis' });
    }

    const teacher = await User.findById(req.user._id);

    console.log('📝 markBulkAbsence Payload:', JSON.stringify(req.body, null, 2));

    // Verify teacher teaches this class
    if (!teacher.classes.includes(classId)) {
      console.log('⛔ Teacher does not teach this class:', classId);
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

        // Check if absence already exists
        const startOfDay = new Date(absenceDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(absenceDate);
        endOfDay.setHours(23, 59, 59, 999);

        let absence = await Absence.findOne({
          student: studentId,
          class: classId,
          date: { $gte: startOfDay, $lte: endOfDay },
          subject,
          startTime
        });

        // Need student info for notification (populate parents)
        const student = await Student.findById(studentId).populate('parents');

        if (!student) {
          console.log(`❌ Student not found: ${studentId}`);
          results.errors.push({ studentId, error: 'Student not found' });
          continue;
        }

        if (absence) {
          // Update existing
          console.log(`🔄 Updating existing absence for student ${student.firstName} ${student.lastName}`);
          absence.absenceType = status; // Map status to absenceType
          if (reason) absence.reason = reason;
          if (notes) absence.notes = notes;
          if (subject) absence.subject = subject;
          if (startTime) absence.startTime = startTime;
          await absence.save();
          results.created++; // Treating update as "recording" an absence
        } else {
          // Create new absence
          console.log(`✨ Creating new absence for student ${student.firstName} ${student.lastName}`);
          absence = await Absence.create({
            student: studentId,
            class: classId,
            teacher: req.user._id,
            absenceType: status, // Map status to absenceType
            status: 'unjustified', // Default to unjustified
            reason,
            notes,
            subject,
            startTime,
            date: absenceDate,
          });
          results.created++;
        }

        // Send notification logic (Shared for both create and update)
        // Check if we should send a notification:
        // 1. Student has a parent
        // 2. Status is 'absent' or 'retard'
        // 3. Notification hasn't been sent yet OR we want to resend on update? 
        //    Let's trigger it if status is compatible. Ideally we might want to check if status CHANGED, 
        //    but for now, ensuring parents get the alert is safer.

        // Note: For now, we set notificationSent to true after sending. 
        // If updating, we might want to resend? Let's assume we resend for now to be safe, 
        // or check if notificationSent is false. 
        // The user issue is NO notification received, so let's force send if conditions met.

        if (student.parents && student.parents.length > 0 && (status === 'absent' || status === 'retard')) {
          console.log(`🚀 Attempting to send notification to ${student.parents.length} parents`);

          let anySent = false;
          for (const parent of student.parents) {
            const sent = await sendAbsenceNotification(
              parent._id,
              student,
              status,
              absenceDate,
              subject,
              startTime
            );
            if (sent) anySent = true;
          }

          if (anySent) {
            console.log('✅ Notification marked as sent in DB');
            absence.notificationSent = true;
            await absence.save();
          }
        } else {
          console.log('ℹ️ Skipping notification: Parents missing or status not absent/retard');
        }

      } catch (err) {
        console.error(`❌ Error processing student ${studentData.studentId}:`, err);
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

// @desc    Obtenir toutes les absences du professeur
// @route   GET /api/teacher/absences
// @access  Private/Teacher
exports.getMyAbsences = async (req, res) => {
  try {
    const teacher = await User.findById(req.user._id).populate('classes');

    if (!teacher.classes || teacher.classes.length === 0) {
      return res.status(200).json({
        count: 0,
        absences: [],
      });
    }

    const classIds = teacher.classes.map(c => c._id);

    const absences = await Absence.find({ class: { $in: classIds } })
      .populate('student', 'firstName lastName uniqueCode')
      .populate('class', 'name level')
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
