const User = require('../models/User');
const School = require('../models/School');
const Class = require('../models/Class');
const Student = require('../models/Student');
const generateStudentCode = require('../utils/generateStudentCode');

// @desc    Créer une école (Super Admin seulement)
// @route   POST /api/superadmin/create-school
// @access  Private/SuperAdmin
exports.createSchool = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Le nom de l'école, l'email et le mot de passe sont requis" 
      });
    }

    // Vérifier si l'email existe déjà
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
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
      email: email.toLowerCase(),
    });

    // Créer le compte User pour l'école (role: 'school')
    const schoolUser = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'school',
      school: school._id,
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

    // Vérifier que l'école existe
    const schoolUser = await User.findById(req.user._id);
    if (!schoolUser.school) {
      return res.status(400).json({ message: "Aucune école associée" });
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
      school: schoolUser.school,
    });

    // Ajouter le professeur à l'école
    await School.findByIdAndUpdate(schoolUser.school, {
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
      return res.status(400).json({ message: "Aucune école associée" });
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

    const createdClass = await Class.findById(classObj._id)
      .populate('school', 'name');

    res.status(201).json({
      message: 'Classe créée avec succès',
      class: createdClass,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Créer un élève
// @route   POST /api/admin/create-student
// @access  Private/School
exports.createStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, classId } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({ message: 'Le prénom et le nom sont requis' });
    }

    // Vérifier que l'école existe
    const schoolUser = await User.findById(req.user._id);
    if (!schoolUser.school) {
      return res.status(400).json({ message: "Aucune école associée" });
    }

    // Vérifier que la classe appartient à l'école si spécifiée
    if (classId) {
      const classObj = await Class.findById(classId);
      if (!classObj || classObj.school.toString() !== schoolUser.school.toString()) {
        return res.status(400).json({ message: "Cette classe n'appartient pas à votre école" });
      }
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
      school: schoolUser.school,
    });

    // Si une classe est spécifiée, ajouter l'élève à la classe
    if (classId) {
      await Class.findByIdAndUpdate(classId, {
        $push: { students: student._id },
      });
    }

    const createdStudent = await Student.findById(student._id)
      .populate('class', 'name level')
      .populate('school', 'name');

    res.status(201).json({
      message: 'Élève créé avec succès',
      student: createdStudent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

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
      return res.status(403).json({ message: 'Cet élève n\'appartient pas à votre école' });
    }
    if (classObj.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Cette classe n\'appartient pas à votre école' });
    }

    // Retirer l'élève de son ancienne classe si applicable
    if (student.class) {
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: studentId },
      });
    }

    // Assigner l'élève à la classe
    student.class = classId;
    await student.save();

    // Ajouter l'élève à la liste des élèves de la classe
    if (!classObj.students.includes(studentId)) {
      classObj.students.push(studentId);
      await classObj.save();
    }

    const updatedStudent = await Student.findById(studentId)
      .populate('class', 'name level')
      .populate('school', 'name');

    res.status(200).json({
      message: 'Élève assigné à la classe avec succès',
      student: updatedStudent,
    });
  } catch (error) {
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
      return res.status(403).json({ message: 'Ce professeur n\'appartient pas à votre école' });
    }
    if (classObj.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Cette classe n\'appartient pas à votre école' });
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
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir tous les professeurs
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
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir un professeur par ID
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
    if (teacher.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à ce professeur' });
    }

    res.status(200).json({
      teacher,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour un professeur
// @route   PUT /api/admin/teachers/:id
// @access  Private/School
exports.updateTeacher = async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    const schoolUser = await User.findById(req.user._id);

    const teacher = await User.findById(req.params.id);

    if (!teacher) {
      return res.status(404).json({ message: 'Professeur non trouvé' });
    }

    // Vérifier que le professeur appartient à l'école
    if (teacher.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à ce professeur' });
    }

    // Vérifier que le rôle est toujours teacher
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas un professeur' });
    }

    // Mettre à jour les champs
    if (username) {
      // Vérifier si le nouveau username est disponible
      const usernameExists = await User.findOne({ 
        username, 
        _id: { $ne: teacher._id } 
      });
      if (usernameExists) {
        return res.status(400).json({ message: 'Ce nom d\'utilisateur est déjà utilisé' });
      }
      teacher.username = username;
    }
    
    if (phone) {
      // Vérifier si le nouveau téléphone est disponible
      const phoneExists = await User.findOne({ 
        phone, 
        _id: { $ne: teacher._id } 
      });
      if (phoneExists) {
        return res.status(400).json({ message: 'Ce numéro de téléphone est déjà utilisé' });
      }
      teacher.phone = phone;
    }
    
    if (password) {
      teacher.password = password; // Le hash sera fait automatiquement par le middleware
    }

    await teacher.save();

    const updatedTeacher = await User.findById(teacher._id)
      .populate('classes', 'name level')
      .select('-password');

    res.status(200).json({
      message: 'Professeur mis à jour avec succès',
      teacher: updatedTeacher,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer un professeur
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
      return res.status(403).json({ message: 'Vous n\'avez pas accès à ce professeur' });
    }

    // Vérifier que le rôle est teacher
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ message: 'Cet utilisateur n\'est pas un professeur' });
    }

    // Retirer le professeur de l'école
    await School.findByIdAndUpdate(schoolUser.school, {
      $pull: { teachers: teacher._id },
    });

    // Retirer le professeur de toutes les classes
    await Class.updateMany(
      { teachers: teacher._id },
      { $pull: { teachers: teacher._id } }
    );

    // Supprimer le professeur
    await teacher.deleteOne();

    res.status(200).json({
      message: 'Professeur supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
