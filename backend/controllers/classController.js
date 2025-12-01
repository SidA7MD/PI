const Class = require('../models/Class');
const User = require('../models/User');
const School = require('../models/School');
const Student = require('../models/Student');

// @desc    Obtenir toutes les classes
// @route   GET /api/class
// @access  Private
exports.getAllClasses = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const classes = await Class.find({ school: user.school })
      .populate('students', 'firstName lastName')
      .populate('teachers', 'username')
      .sort({ name: 1 });

    res.status(200).json({
      count: classes.length,
      classes,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Obtenir une classe par ID
// @route   GET /api/class/:id
// @access  Private
exports.getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('students', 'firstName lastName uniqueCode')
      .populate('teachers', 'username phone')
      .populate('school', 'name');

    if (!classObj) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    res.status(200).json({
      class: classObj,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Mettre à jour une classe
// @route   PUT /api/class/:id
// @access  Private/School
exports.updateClass = async (req, res) => {
  try {
    const { name, level, schoolYear, active } = req.body;
    const schoolUser = await User.findById(req.user._id);

    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Vérifier que la classe appartient à l'école
    if (classObj.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à cette classe' });
    }

    // Mettre à jour les champs
    if (name) classObj.name = name;
    if (level) classObj.level = level;
    if (schoolYear) classObj.schoolYear = schoolYear;
    if (active !== undefined) classObj.active = active;

    await classObj.save();

    const updatedClass = await Class.findById(classObj._id)
      .populate('students', 'firstName lastName')
      .populate('teachers', 'username')
      .populate('school', 'name');

    res.status(200).json({
      message: 'Classe mise à jour avec succès',
      class: updatedClass,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// @desc    Supprimer une classe
// @route   DELETE /api/class/:id
// @access  Private/School
exports.deleteClass = async (req, res) => {
  try {
    const schoolUser = await User.findById(req.user._id);
    const classObj = await Class.findById(req.params.id);

    if (!classObj) {
      return res.status(404).json({ message: 'Classe non trouvée' });
    }

    // Vérifier que la classe appartient à l'école
    if (classObj.school.toString() !== schoolUser.school.toString()) {
      return res.status(403).json({ message: 'Vous n\'avez pas accès à cette classe' });
    }

    // Retirer la classe de l'école
    await School.findByIdAndUpdate(classObj.school, {
      $pull: { classes: classObj._id },
    });

    // Retirer la classe de tous les professeurs
    await User.updateMany(
      { classes: classObj._id },
      { $pull: { classes: classObj._id } }
    );

    // Retirer tous les élèves de la classe
    await Student.updateMany(
      { class: classObj._id },
      { $unset: { class: 1 } }
    );

    await classObj.deleteOne();

    res.status(200).json({
      message: 'Classe supprimée avec succès',
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};
