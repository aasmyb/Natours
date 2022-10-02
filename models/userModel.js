const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'User confirm your password'],
    validate: {
      // This only works on CREATE and SAVE!!
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords are not the same',
    },
  },
  photo: String,
});

userSchema.pre('save', async function (next) {
  // Only run this fn if password was modified
  if (!this.isModified('password')) return next();

  // Hash the pass with cost of 12 and delete password field
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.correctPassword = async (candidatePass, userPass) =>
  await bcrypt.compare(candidatePass, userPass);

userSchema.methods.signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
