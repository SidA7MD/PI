const User = require('../models/User');
const School = require('../models/School');
const Class = require('../models/Class');
const Student = require('../models/Student');
const generateStudentCode = require('../utils/generateStudentCode');

// @desc    Créer une école
// @route   POST /api/admin/create-school
// @access  Private/Admin
exports.createSchool = async (req, res) => {
  try {
    const { name, address, phone, email } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Le nom de l'école est requis" });
    }

    const school = await School.create({
      name,
      address,
      phone,
      email,
      admins: [req.user._id],
    });

    // Associer l'école à l'admin
    await User.findByIdAndUpdate(req.user._id, { school: school._id });

    res.status(201).json({
      message: 'École créée avec succès',
      school,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer un professeur
// @route   POST /api/admin/create-teacher
// @access  Private/Admin
exports.createTeacher = async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    // Vérifier que l'admin a une école
    const admin = await User.findById(req.user._id).populate('school');
    if (!admin.school) {
      return res.status(400).json({ message: "Vous devez d'abord créer une école" });
    }

    // Vérifier si le professeur existe déjà
    const teacherExists = await User.findOne({ $or: [{ username }, { phone }] });
    if (teacherExists) {
      return res.status(400).json({ message: 'Ce professeur existe déjà' });
    }

    // Créer le professeur
    const teacher = await User.create({
      username,
      phone,
      password,
      role: 'teacher',
      school: admin.school._id,
    });

    // Ajouter le professeur à l'école
    await School.findByIdAndUpdate(admin.school._id, {
      $push: { teachers: teacher._id },
    });

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
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer une classe
// @route   POST /api/admin/create-class
// @access  Private/Admin
exports.createClass = async (req, res) => {
  try {
    const { name, level, schoolYear } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Le nom de la classe est requis' });
    }

    // Vérifier que l'admin a une école
    const admin = await User.findById(req.user._id).populate('school');
    if (!admin.school) {
      return res.status(400).json({ message: "Vous devez d'abord créer une école" });
    }

    // Créer la classe
    const classObj = await Class.create({
      name,
      level,
      schoolYear,
      school: admin.school._id,
    });

    // Ajouter la classe à l'école
    await School.findByIdAndUpdate(admin.school._id, {
      $push: { classes: classObj._id },
    });

    res.status(201).json({
      message: 'Classe créée avec succès',
      class: classObj,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer un élève
// @route   POST /api/admin/create-student
// @access  Private/Admin
exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, classId } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Le prénom et le nom sont requis' });
    }

    // Vérifier que l'admin a une école
    const admin = await User.findById(req.user._id).populate('school');
    if (!admin.school) {
      return res.status(400).json({ message: "Vous devez d'abord créer une école" });
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
      class: classId || null,
      school: admin.school._id,
    });

    // Si une classe est spécifiée, ajouter l'élève à la classe
    if (classId) {
      await Class.findByIdAndUpdate(classId, {
        $push: { students: student._id },
      });
    }

    res.status(201).json({
      message: 'Élève créé avec succès',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Assigner un élève à une classe
// @route   POST /api/admin/assign-student-to-class
// @access  Private/Admin
exports.assignStudentToClass = async (req, res) => {
  try {
    const { studentId, classId } = req.body;

    if (!studentId || !classId) {
      return res.status(400).json({ message: "L'ID de l'élève et de la classe sont requis" });
    }

    // Vérifier que l'élève et la classe existent
    const student = await Student.findById(studentId);
    const classObj = await Class.findById(classId);

    if (!student || !classObj) {
      return res.status(404).json({ message: 'Élève ou classe non trouvé' });
    }

    // Assigner l'élève à la classe
    student.class = classId;
    await student.save();

    // Ajouter l'élève à la liste des élèves de la classe
    if (!classObj.students.includes(studentId)) {
      classObj.students.push(studentId);
      await classObj.save();
    }

    res.status(200).json({
      message: 'Élève assigné à la classe avec succès',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Assigner un professeur à une classe
// @route   POST /api/admin/assign-teacher-to-class
// @access  Private/Admin
exports.assignTeacherToClass = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;

    if (!teacherId || !classId) {
      return res.status(400).json({ message: "L'ID du professeur et de la classe sont requis" });
    }

    // Vérifier que le professeur et la classe existent
    const teacher = await User.findById(teacherId);
    const classObj = await Class.findById(classId);

    if (!teacher || !classObj || teacher.role !== 'teacher') {
      return res.status(404).json({ message: 'Professeur ou classe non trouvé' });
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

    res.status(200).json({
      message: 'Professeur assigné à la classe avec succès',
      teacher: {
        id: teacher._id,
        username: teacher.username,
        classes: teacher.classes,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir toutes les écoles
// @route   GET /api/admin/schools
// @access  Private/Admin
exports.getSchools = async (req, res) => {
  try {
    const schools = await School.find()
      .populate('admins', 'username phone')
      .populate('teachers', 'username phone')
      .populate('classes', 'name level');

    res.status(200).json({
      count: schools.length,
      schools,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir tous les professeurs
// @route   GET /api/admin/teachers
// @access  Private/Admin
exports.getTeachers = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    const teachers = await User.find({
      role: 'teacher',
      school: admin.school,
    }).populate('classes', 'name level');

    res.status(200).json({
      count: teachers.length,
      teachers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
