const mongoose = require('mongoose');
const validator = require('validator');

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
    required: [true, 'Please provide a password .'],
    minlength: 8,
  },
  confirmPassword: {
    type: String,
    required: [true, 'User confirm your password.'],
  },
  photo: String,
});

const User = mongoose.model('User', userSchema);

module.exports = User;
