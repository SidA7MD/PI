const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');
const mongoose = require('mongoose');

// @desc    Obtenir tous les élèves
// @route   GET /api/student
// @access  Private/School
exports.getAllStudents = async (req, res) => {
  try {
    const schoolUser = await User.findById(req.user._id);

    if (!schoolUser.school) {
      return res.status(400).json({ message: 'Aucune école associée' });
    }

    const students = await Student.find({ school: schoolUser.school })
      .populate('classes', 'name level')
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
      .populate('classes', 'name level')
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
// @access  Private/School
exports.updateStudent = async (req, res) => {
  console.log('\n========== UPDATE STUDENT DEBUG ==========');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Student ID:', req.params.id);
  try {
    const { firstName, lastName, dateOfBirth, active, classId } = req.body;
    const schoolUser = await User.findById(req.user._id);
    console.log('School user ID:', schoolUser?._id, 'School:', schoolUser?.school);

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Vérifier que l'élève appartient à l'école de l'utilisateur
    if (student.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à cet élève' });
    }

    // Mettre à jour les champs
    if (firstName) student.firstName = firstName;
    if (lastName) student.lastName = lastName;
    if (dateOfBirth) student.dateOfBirth = dateOfBirth;
    if (active !== undefined) student.active = active;
    
    // Gérer le changement de classe
    // Gérer le changement de classes (tableau d'IDs)
    console.log('Classes from request:', req.body.classes);
    console.log('Is array:', Array.isArray(req.body.classes));
    if (req.body.classes && Array.isArray(req.body.classes)) {
      console.log('Entering class assignment block...');
      try {
        const newClassIds = req.body.classes.map(id => new mongoose.Types.ObjectId(id));
        const studentId = student._id;

        console.log(`Syncing classes for student ${student.firstName}. New classes:`, newClassIds);

        // 1. Retirer l'élève des classes qui ne sont PLUS dans la liste
        const pullRes = await Class.updateMany(
          { 
            students: studentId, 
            _id: { $nin: newClassIds }
          }, 
          { $pull: { students: studentId } }
        );
        console.log(`Removed student ${studentId} from ${pullRes.modifiedCount} classes`);

        // 2. Ajouter l'élève aux nouvelles classes
        const pushRes = await Class.updateMany(
          { 
            _id: { $in: newClassIds }
          }, 
          { $addToSet: { students: studentId } }
        );
        console.log(`Added student ${studentId} to ${pushRes.modifiedCount} classes`);

        student.classes = newClassIds;
      } catch (castErr) {
        console.error('Error casting class IDs in updateStudent:', castErr);
      }
    } else if (classId) {
      // Legacy backward compatibility for single classId
      try {
        const cId = new mongoose.Types.ObjectId(classId);
        if (!student.classes) student.classes = [];
        if (!student.classes.some(id => id.toString() === cId.toString())) {
          student.classes.push(cId);
          await Class.findByIdAndUpdate(cId, { $addToSet: { students: student._id } });
        }
      } catch (err) {}
    }

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate('classes', 'name level')
      .populate('parent', 'username phone');

    res.status(200).json({
      message: 'Élève mis à jour avec succès',
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer un élève
// @route   DELETE /api/student/:id
// @access  Private/School
exports.deleteStudent = async (req, res) => {
  try {
    const schoolUser = await User.findById(req.user._id);
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: 'Élève non trouvé' });
    }

    // Vérifier que l'élève appartient à l'école de l'utilisateur
    if (student.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à cet élève' });
    }

    // Retirer l'élève de toutes les classes
    await Class.updateMany({ students: student._id }, { $pull: { students: student._id } });

    await student.deleteOne();

    res.status(200).json({
      message: 'Élève supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
