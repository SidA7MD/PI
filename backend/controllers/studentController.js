const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');

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
// @access  Private/School
exports.updateStudent = async (req, res) => {
  try {
    const { firstName, lastName, dateOfBirth, active, classId } = req.body;
    const schoolUser = await User.findById(req.user._id);

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
    if (classId !== undefined) {
      const oldClassId = student.class;
      
      // Retirer l'élève de l'ancienne classe
      if (oldClassId) {
        await Class.findByIdAndUpdate(oldClassId, {
          $pull: { students: student._id },
        });
      }
      
      // Assigner à la nouvelle classe
      if (classId) {
        // Vérifier que la classe appartient à l'école
        const newClass = await Class.findById(classId);
        if (!newClass || newClass.school.toString() !== schoolUser.school.toString()) {
          return res.status(403).json({ message: 'Cette classe n\'appartient pas à votre école' });
        }
        
        student.class = classId;
        await Class.findByIdAndUpdate(classId, {
          $addToSet: { students: student._id },
        });
      } else {
        // Retirer de la classe (classId est null ou vide)
        student.class = null;
      }
    }

    await student.save();

    const updatedStudent = await Student.findById(student._id)
      .populate('class', 'name level')
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

    await student.deleteOne();

    res.status(200).json({
      message: 'Élève supprimé avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
