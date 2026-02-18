const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: function () {
        // Username not required for school role (uses email)
        return this.role !== 'school';
      },
      unique: true,
      sparse: true,
      trim: true,
    },
    phone: {
      type: String,
      required: function () {
        // Phone required only for parent role
        return this.role === 'parent';
      },
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['superadmin', 'school', 'teacher', 'parent'],
      required: true,
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    pushToken: {
      type: String,
      default: null,
    },
    classes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
      },
    ],
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
      },
    ],
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  // Convert null to undefined for unique sparse fields to avoid index conflicts
  if (this.phone === null) this.phone = undefined;
  if (this.username === null) this.username = undefined;

  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);