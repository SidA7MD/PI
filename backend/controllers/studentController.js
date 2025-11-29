const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Obtenir tous les élèves
// @route   GET /api/student
// @access  Private/Admin
exports.getAllStudents = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);

    const students = await Student.find({ school: admin.school })
      .populate('class', 'name level')
      .populate('parent', 'username phone')
      .sort({ lastName: 1 });

    res.status(200).json({
      count: students.length,
      students,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir un élève par ID
// @route   GET /api/student/:id
// @access  Private
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('class', 'name level')
      .populate('parent', 'username phone')
      .populate('school', 'name');

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    res.status(200).json({
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour un élève
// @route   PUT /api/student/:id
// @access  Private/Admin
exports.updateStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, active } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Mettre à jour les champs
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (active !== undefined) student.active = active;

    await student.save();

    res.status(200).json({
      message: 'Élève mis à jour avec succès',
      student,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer un élève
// @route   DELETE /api/student/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    await student.deleteOne();

    res.status(200).json({
      message: 'Élève supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
