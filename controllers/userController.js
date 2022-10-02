const catchAsync = require('./../utils/catchAsync');
const User = require('./../models/userModel');

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  // Send response
  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: users.length,
    data: { users },
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.',
  });
};

exports.addNewUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'The route is not yet defined.',
  });
};
