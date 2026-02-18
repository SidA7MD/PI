const mongoose = require('mongoose');
const User = require('../models/User');
const School = require('../models/School');
const Class = require('../models/Class');
const Student = require('../models/Student');
const Absence = require('../models/Absence');
const generateStudentCode = require('../utils/generateStudentCode');

// ============================================
// SUPER ADMIN - SCHOOL MANAGEMENT
// ============================================

// @desc    Créer une école (Super Admin seulement)
// @route   POST /api/superadmin/create-school
// @access  Private/SuperAdmin
exports.createSchool = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Le nom de l'école, l'email et le mot de passe sont requis",
      });
    }

    // Vérifier si l'email existe déjà dans User ou School
    const emailLower = email.toLowerCase();
    const userEmailExists = await User.findOne({ email: emailLower });
    const schoolEmailExists = await School.findOne({ email: emailLower });

    if (userEmailExists || schoolEmailExists) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }

    // Vérifier si une école avec ce nom existe déjà
    const schoolExists = await School.findOne({ name });
    if (schoolExists) {
      return res.status(400).json({ message: 'Une école avec ce nom existe déjà' });
    }

    // Créer l'école dans la base de données
    const school = await School.create({
      name,
      email: emailLower,
    });

    try {
      // Nettoyer les anciens conflits "phone: null" s'ils existent dans la base
      await User.updateMany({ phone: null }, { $unset: { phone: "" } });
      await User.updateMany({ username: null }, { $unset: { username: "" } });

      // Créer le compte User pour l'école (role: 'school')
      const schoolUser = await User.create({
        username: `school_${school._id}_${Date.now()}`, // Username unique garanti
        email: emailLower,
        password,
        role: 'school',
        school: school._id,
        phone: undefined,
      });

      // Ajouter l'utilisateur école aux admins de l'école
      school.admins.push(schoolUser._id);
      await school.save();

      res.status(201).json({
        message: 'École créée avec succès',
        school: {
          id: school._id,
          name: school.name,
          email: school.email,
        },
      });
    } catch (userErr) {
      // Si la création du compte user échoue, supprimer l'école créée
      console.error('Error creating school user - rolling back school creation:', userErr);
      await School.findByIdAndDelete(school._id);
      throw userErr; // Sera rattrapé par le catch global
    }
  } catch (error) {
    console.error('Error in createSchool:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir toutes les écoles (Super Admin seulement)
// @route   GET /api/superadmin/schools
// @access  Private/SuperAdmin
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .populate('admins', 'email role')
      .populate('teachers', 'username phone')
      .populate('classes', 'name level')
      .select('-__v')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: schools.length,
      schools,
    });
  } catch (error) {
    console.error('Error in getAllSchools:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ============================================
// SCHOOL ADMIN - TEACHER MANAGEMENT
// ============================================

// @desc    Get all teachers for a school
// @route   GET /api/admin/teachers
// @access  Private/School
exports.getTeachers = async (req, res) => {
  try {
    const schoolUser = await User.findById(req.user._id);

    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    const teachers = await User.find({
      role: 'teacher',
      school: schoolUser.school,
    }).populate('classes', 'name level');

    res.status(200).json({
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    console.error('Error in getTeachers:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Get a single teacher by ID
// @route   GET /api/admin/teachers/:id
// @access  Private/School
exports.getTeacherById = async (req, res) => {
  try {
    const schoolUser = await User.findById(req.user._id);
    const teacher = await User.findById(req.params.id)
      .populate('classes', 'name level')
      .populate('school', 'name');

    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    // Vérifier que le professeur appartient à l'école
    if (teacher.school && teacher.school._id.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce professeur" });
    }

    res.status(200).json({
      teacher,
    });
  } catch (error) {
    console.error('Error in getTeacherById:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Create a new teacher and optionally assign to class
// @route   POST /api/admin/create-teacher
// @access  Private/School
exports.createTeacher = async (req, res) => {
  try {
    const { username, phone, email, password, classId } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Nom d\'utilisateur et mot de passe sont requis' });
    }

    // Vérifier que l'école existe
    const schoolUser = await User.findById(req.user._id);
    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    // Vérifier si le nom d'utilisateur existe déjà
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
    }

    // Vérifier si le téléphone existe déjà (si fourni)
    if (phone) {
      const phoneExists = await User.findOne({ phone });
      if (phoneExists) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
      }
    }

    // Vérifier si l'email existe déjà (si fourni)
    if (email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    // Créer le professeur
    const teacher = await User.create({
      username,
      phone: phone || undefined,
      email: email || undefined,
      password,
      role: 'teacher',
      school: schoolUser.school,
    });

    // Ajouter le professeur à l'école
    await School.findByIdAndUpdate(schoolUser.school, {
      $push: { teachers: teacher._id },
    });

    // Si des classes sont fournies, assigner le professeur
    if (req.body.classes && Array.isArray(req.body.classes)) {
      try {
        const classIds = req.body.classes.map(id => new mongoose.Types.ObjectId(id));
        const teacherId = teacher._id;

        console.log(`Syncing classes for NEW teacher ${teacher.username}. Classes:`, classIds);

        // Mettre à jour le professeur
        teacher.classes = classIds;
        await teacher.save();

        // Mettre à jour les classes (ajouter le prof)
        const syncRes = await Class.updateMany(
          { _id: { $in: classIds } },
          { $addToSet: { teachers: teacherId } }
        );
        console.log('Push result (classes for new teacher):', syncRes.modifiedCount);
      } catch (castErr) {
        console.error('Error casting class IDs in createTeacher:', castErr);
      }
    }

    res.status(201).json({
      message: 'Professeur créé avec succès',
      teacher: {
        id: teacher._id,
        username: teacher.username,
        phone: teacher.phone,
        role: teacher.role,
      },
    });
  } catch (error) {
    console.error('Error in createTeacher:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Update a teacher and manage class assignment
// @route   PUT /api/admin/teachers/:id
// @access  Private/School
exports.updateTeacher = async (req, res) => {
  try {
    const { username, phone, password, classId } = req.body;
    const schoolUser = await User.findById(req.user._id);

    const teacher = await User.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    // Vérifier que le professeur appartient à l'école
    if (teacher.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce professeur" });
    }

    // Vérifier que le rôle est toujours teacher
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: "Cet utilisateur n'est pas un professeur" });
    }

    // Mettre à jour les champs
    if (username) {
      // Vérifier si le nouveau username est disponible
      const usernameExists = await User.findOne({
        username,
        _id: { $ne: teacher._id },
      });
      if (usernameExists) {
        return res.status(400).json({ message: "Ce nom d'utilisateur est déjà utilisé" });
      }
      teacher.username = username;
    }

    if (phone) {
      // Vérifier si le nouveau téléphone est disponible
      const phoneExists = await User.findOne({
        phone,
        _id: { $ne: teacher._id },
      });
      if (phoneExists) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
      }
      teacher.phone = phone;
    }

    if (password && password.trim() !== '') {
      teacher.password = password; // Le hash sera fait automatiquement par le middleware
    }

    await teacher.save();

    // Gérer l'assignation de classe
    // Gérer l'assignation de classes (tableau d'IDs)
    if (req.body.classes && Array.isArray(req.body.classes)) {
      try {
        const newClassIds = req.body.classes.map(id => new mongoose.Types.ObjectId(id));
        const teacherId = teacher._id;

        console.log(`Syncing classes for teacher ${teacher.username}. Classes:`, newClassIds);

        // 1. Retirer le professeur des classes qui ne sont PLUS dans la liste
        const pullRes = await Class.updateMany(
          {
            teachers: teacherId,
            _id: { $nin: newClassIds }
          },
          { $pull: { teachers: teacherId } }
        );
        console.log('Pull result (classes):', pullRes.modifiedCount);

        // 2. Ajouter le professeur aux nouvelles classes
        const pushRes = await Class.updateMany(
          {
            _id: { $in: newClassIds }
          },
          { $addToSet: { teachers: teacherId } }
        );
        console.log('Push result (classes):', pushRes.modifiedCount);

        // 3. Mettre à jour la liste des classes du professeur
        teacher.classes = newClassIds;
        await teacher.save();
      } catch (castErr) {
        console.error('Error casting class IDs in updateTeacher:', castErr);
      }
    } else if (classId) {
      // Backward compatibility for single classId
      // Logic removed to encourage array usage, or keep if needed:
      // For now, assume frontend updates to send classes array
    }

    const updatedTeacher = await User.findById(teacher._id)
      .populate('classes', 'name level')
      .select('-password');

    res.status(200).json({
      message: 'Professeur mis à jour avec succès',
      teacher: updatedTeacher,
    });
  } catch (error) {
    console.error('Error in updateTeacher:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Delete a teacher
// @route   DELETE /api/admin/teachers/:id
// @access  Private/School
exports.deleteTeacher = async (req, res) => {
  try {
    const schoolUser = await User.findById(req.user._id);
    const teacher = await User.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    // Vérifier que le professeur appartient à l'école
    if (teacher.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Vous n'avez pas accès à ce professeur" });
    }

    // Vérifier que le rôle est teacher
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: "Cet utilisateur n'est pas un professeur" });
    }

    // Retirer le professeur de l'école
    await School.findByIdAndUpdate(schoolUser.school, {
      $pull: { teachers: teacher._id },
    });

    // Retirer le professeur de toutes les classes
    await Class.updateMany({ teachers: teacher._id }, { $pull: { teachers: teacher._id } });

    // Supprimer le professeur
    await teacher.deleteOne();

    res.status(200).json({
      message: 'Professeur supprimé avec succès',
    });
  } catch (error) {
    console.error('Error in deleteTeacher:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ============================================
// SCHOOL ADMIN - CLASS MANAGEMENT
// ============================================

// @desc    Créer une classe
// @route   POST /api/admin/create-class
// @access  Private/School
exports.createClass = async (req, res) => {
  try {
    const { name, level, schoolYear } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de la classe est requis' });
    }

    // Vérifier que l'école existe
    const schoolUser = await User.findById(req.user._id);
    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    // Créer la classe
    const classObj = await Class.create({
      name,
      level,
      schoolYear,
      school: schoolUser.school,
    });

    // Ajouter la classe à l'école
    await School.findByIdAndUpdate(schoolUser.school, {
      $push: { classes: classObj._id },
    });

    // Si des professeurs sont fournis, les assigner
    if (req.body.teachers && Array.isArray(req.body.teachers)) {
      try {
        const teacherIds = req.body.teachers.map(id => new mongoose.Types.ObjectId(id));
        const classId = classObj._id;

        console.log(`Syncing teachers for NEW class ${classObj.name}. Teachers:`, teacherIds);

        // Mettre à jour la classe avec les professeurs
        classObj.teachers = teacherIds;
        await classObj.save();

        // Mettre à jour les professeurs pour ajouter cette classe
        const syncRes = await User.updateMany(
          {
            _id: { $in: teacherIds }
          },
          { $addToSet: { classes: classId } }
        );
        console.log('Push result (teachers in new class):', syncRes.modifiedCount);
      } catch (castErr) {
        console.error('Error casting teacher IDs in createClass:', castErr);
      }
    }

    const createdClass = await Class.findById(classObj._id)
      .populate('teachers', 'username phone')
      .populate('school', 'name');

    res.status(201).json({
      message: 'Classe créée avec succès',
      class: createdClass,
    });
  } catch (error) {
    console.error('Error in createClass:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ============================================
// SCHOOL ADMIN - STUDENT MANAGEMENT
// ============================================

// @desc    Créer un élève
// @route   POST /api/admin/create-student
// @access  Private/School
exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, classes } = req.body;
    // Note: 'classes' attendaient un tableau d'IDs

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Le prénom et le nom sont requis' });
    }

    // Vérifier que l'école existe
    const schoolUser = await User.findById(req.user._id);
    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    // Générer un code unique
    let uniqueCode;
    let codeExists = true;

    while (codeExists) {
      uniqueCode = generateStudentCode();
      const existingStudent = await Student.findOne({ uniqueCode });
      if (!existingStudent) {
        codeExists = false;
      }
    }

    // Créer l'élève
    const student = await Student.create({
      firstName,
      lastName,
      dateOfBirth,
      uniqueCode,
      classes: classes || [],
      school: schoolUser.school,
    });

    // Ajouter l'élève aux classes spécifiées
    if (classes && Array.isArray(classes) && classes.length > 0) {
      await Class.updateMany(
        { _id: { $in: classes }, school: schoolUser.school },
        { $addToSet: { students: student._id } }
      );
    }

    const createdStudent = await Student.findById(student._id)
      .populate('classes', 'name level')
      .populate('school', 'name');

    res.status(201).json({
      message: 'Élève créé avec succès',
      student: createdStudent,
    });
  } catch (error) {
    console.error('Error in createStudent:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// ============================================
// SCHOOL ADMIN - ASSIGNMENTS
// ============================================

// @desc    Assigner un élève à une classe
// @route   POST /api/admin/assign-student-to-class
// @access  Private/School
exports.assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.body;
    const schoolUser = await User.findById(req.user._id);

    if (!studentId || !classId) {
      return res.status(400).json({ message: "L'ID de l'élève et de la classe sont requis" });
    }

    // Vérifier que l'élève et la classe existent
    const student = await Student.findById(studentId);
    const classObj = await Class.findById(classId);

    if (!student || !classObj) {
      return res.status(404).json({ message: 'Élève ou classe non trouvé' });
    }

    // Vérifier que l'élève et la classe appartiennent à l'école
    if (student.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Cet élève n'appartient pas à votre école" });
    }
    if (classObj.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Cette classe n'appartient pas à votre école" });
    }

    // Vérifier si l'élève est déjà dans la classe
    if (student.classes && student.classes.includes(classId)) {
      return res.status(400).json({ message: "L'élève est déjà dans cette classe" });
    }

    // Assigner l'élève à la classe (ajouter à la liste)
    student.classes.push(classId);
    await student.save();

    // Ajouter l'élève à la liste des élèves de la classe
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: studentId }
    });

    const updatedStudent = await Student.findById(studentId)
      .populate('classes', 'name level')
      .populate('school', 'name');

    res.status(200).json({
      message: 'Élève assigné à la classe avec succès',
      student: updatedStudent,
    });
  } catch (error) {
    console.error('Error in assignStudentToClass:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Assigner un professeur à une classe
// @route   POST /api/admin/assign-teacher-to-class
// @access  Private/School
exports.assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;
    const schoolUser = await User.findById(req.user._id);

    if (!teacherId || !classId) {
      return res.status(400).json({ message: "L'ID du professeur et de la classe sont requis" });
    }

    // Vérifier que le professeur et la classe existent
    const teacher = await User.findById(teacherId);
    const classObj = await Class.findById(classId);

    if (!teacher || !classObj || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Professeur ou classe non trouvé' });
    }

    // Vérifier que le professeur et la classe appartiennent à l'école
    if (teacher.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Ce professeur n'appartient pas à votre école" });
    }
    if (classObj.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: "Cette classe n'appartient pas à votre école" });
    }

    // Assigner la classe au professeur
    if (!teacher.classes.includes(classId)) {
      teacher.classes.push(classId);
      await teacher.save();
    }

    // Ajouter le professeur à la classe
    if (!classObj.teachers.includes(teacherId)) {
      classObj.teachers.push(teacherId);
      await classObj.save();
    }

    const updatedTeacher = await User.findById(teacherId)
      .populate('classes', 'name level')
      .select('-password');

    res.status(200).json({
      message: 'Professeur assigné à la classe avec succès',
      teacher: {
        id: updatedTeacher._id,
        username: updatedTeacher.username,
        classes: updatedTeacher.classes,
      },
    });
  } catch (error) {
    console.error('Error in assignTeacherToClass:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
// @desc    Obtenir les statistiques globales pour le dashboard admin
// @route   GET /api/admin/stats
// @access  Private/School
exports.getAdminStats = async (req, res) => {
  try {
    const schoolId = req.user.school;

    if (!schoolId) {
      return res.status(400).json({ message: 'Aucune école associée à cet utilisateur' });
    }

    // Dates pour aujourd'hui
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const Absence = require('../models/Absence');

    // Récupérer les classes de l'école
    const targetClasses = await Class.find({ school: schoolId }).distinct('_id');

    // Exécuter les comptages de base
    const [teacherCount, studentCount, classCount] = await Promise.all([
      User.countDocuments({ role: 'teacher', school: schoolId }),
      Student.countDocuments({ school: schoolId }),
      Class.countDocuments({ school: schoolId }),
    ]);

    // Pour les absences, on récupère les IDs d'élèves uniques marqués absents aujourd'hui
    const studentIdsMarkedAbsent = await Absence.find({
      date: { $gte: startOfDay, $lte: endOfDay },
      class: { $in: targetClasses },
      absenceType: 'absent'
    }).distinct('student');

    // On compte combien de ces élèves existent toujours dans cette école
    const absenceCount = await Student.countDocuments({
      _id: { $in: studentIdsMarkedAbsent },
      school: schoolId
    });

    res.status(200).json({
      teachers: teacherCount,
      students: studentCount,
      classes: classCount,
      todayAbsences: absenceCount,
    });
  } catch (error) {
    console.error('Error in getAdminStats:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer une école et toutes ses données (Super Admin seulement)
// @route   DELETE /api/superadmin/schools/:id
// @access  Private/SuperAdmin
exports.deleteSchool = async (req, res) => {
  try {
    const schoolId = req.params.id;
    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({ message: 'École non trouvée' });
    }

    console.log(`\n--- STARTING DELETION FOR SCHOOL: ${school.name} (${schoolId}) ---`);

    // 1. Supprimer les report cards
    const ReportCard = require('../models/ReportCard');
    const rcRes = await ReportCard.deleteMany({ school: schoolId });
    console.log(`Deleted ${rcRes.deletedCount} report cards`);

    // 2. Trouver les classes pour supprimer les absences
    const classIds = await Class.find({ school: schoolId }).distinct('_id');
    const absRes = await Absence.deleteMany({ class: { $in: classIds } });
    console.log(`Deleted ${absRes.deletedCount} absences`);

    // 3. Supprimer les élèves
    const studentRes = await Student.deleteMany({ school: schoolId });
    console.log(`Deleted ${studentRes.deletedCount} students`);

    // 4. Supprimer les classes
    const clRes = await Class.deleteMany({ school: schoolId });
    console.log(`Deleted ${clRes.deletedCount} classes`);

    // 5. Supprimer les utilisateurs liés à cette école (admins et enseignants)
    // Note: On ne supprime pas les parents car ils peuvent avoir des enfants dans d'autres écoles
    const userRes = await User.deleteMany({ school: schoolId, role: { $in: ['school', 'teacher'] } });
    console.log(`Deleted ${userRes.deletedCount} users (school admins & teachers)`);

    // 6. Enfin, supprimer l'école
    await School.findByIdAndDelete(schoolId);
    console.log(`School ${school.name} deleted`);

    res.status(200).json({
      message: 'École et toutes ses données supprimées avec succès',
    });
  } catch (error) {
    console.error('Error in deleteSchool:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression', error: error.message });
  }
};
