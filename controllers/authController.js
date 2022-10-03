const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });
  const token = newUser.signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are sent in req
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  // Check if email and password are correct in DB
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // if everything is 10/10 => send token to the client
  const token = user.signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token, check if it exists
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
  if (!token)
    return next(
      new AppError('You are not logged in, please log in to have access', 401)
    );

  // 2) Verify the token
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 3) Check if user still exists
  const freshUser = await User.findById(decodedToken.id);
  if (!freshUser)
    return next(
      new AppError(
        'The user belonging to this token does not longer exist',
        401
      )
    );

  // 4) If user changed password after awt was issued
  if (freshUser.detectChangedPass(decodedToken.iat))
    return next(
      new AppError(
        'This user recently changed password, please log in again',
        401
      )
    );

  // Grant access to protected route
  req.user = freshUser;
  next();
});

exports.restrictTo = (...userRoles) => {
  return (req, res, next) => {
    if (!userRoles.includes(req.user.role))
      return next(
        new AppError(
          'You do not have the permission to perform that action',
          403
        )
      );

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return next(new AppError('There is no user with that email address', 404));
  // Generate random token
  const resetToken = user.createPassResetToken();
  await user.save({ validateBeforeSave: false });
  // Send it to user's email
  next();
});
exports.resetPassword = (req, res, next) => {};
