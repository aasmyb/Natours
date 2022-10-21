const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const crypto = require('crypto');

const createSendToken = (user, statusCode, req, res, sendUser = false) => {
  const data = sendUser ? { user } : undefined;
  const token = user.signToken(user._id, process.env.JWT_EXPIRES_IN);

  res.cookie('jwt', token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  // 1) Add user to DB
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // 2) Create th token
  const confirmToken = newUser.signToken(
    newUser._id,
    process.env.JWT_EMAIL_CONFIRM_EXPIRES_IN
  );

  // 3) Send confirmation token to email
  const confirmUrl = `${req.protocol}://${req.get(
    'host'
  )}/signup/confirm/${confirmToken}`;
  await new Email(newUser, confirmUrl).sendAccountConfirm();

  res.status(200).json({
    status: 'success',
    message: 'Confirmation token sent to email!',
  });
});

exports.confirmAccountSignup = catchAsync(async (req, res, next) => {
  // 1) Confirm token is valid
  const { token } = req.params;
  const decodedToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // 2) Mark user as confirmed in DB
  let user = await User.findById(decodedToken.id);
  user.confirmed = true;
  user = await user.save({ validateBeforeSave: false });

  // 3) Send welcome email
  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  // 4) Login user
  createSendToken(user, 201, req, res, true);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are sent in req
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  // Check if email and password are correct in DB
  const user = await User.findOne({ email }).select('+password +confirmed');
  if (!user || !(await user.correctPassword(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));

  // Check if account email is confirmed
  if (user.confirmed === false)
    return next(
      new AppError(
        'Your account is not confirmed yet! Please check your email for confirmation link',
        401
      )
    );

  // if everything is 10/10 => send token to the client
  createSendToken(user, 200, req, res);
});

exports.preventLoggedIn = catchAsync(async (req, res, next) => {
  // If user is already logged in
  if (req.cookies.jwt)
    return next(
      new AppError(
        'You are already logged in! You do not have permission to perform this action.',
        401
      )
    );
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Get the token, check if it exists
  let token;
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer')) token = auth.split(' ')[1];
  else if (req.cookies.jwt) token = req.cookies.jwt;
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
  res.locals.user = freshUser;
  next();
});

// Only for render pages => no error
exports.isLoggedIn = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;
    if (!token) return next();

    // 1) Verify the token
    const decodedToken = await promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET
    );

    // 2) Check if user still exists
    const freshUser = await User.findById(decodedToken.id);
    if (!freshUser) return next();

    // 3) If user changed password after awt was issued
    if (freshUser.detectChangedPass(decodedToken.iat)) return next();

    // THERE IS A LOGGED IN USER
    res.locals.user = freshUser;
    next();
  } catch (err) {
    next();
  }
};

exports.logout = (req, res, next) => {
  res.cookie('jwt', 'loggedOut', {
    expires: new Date(Date.now() + 1 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

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
  await user.save({ validateBeforeSave: false }); // Send it to user's email
  try {
    const resetUrl = `${req.protocol}://${req.get(
      'host'
    )}/resetPassword/${resetToken}`;

    await new Email(user, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token send to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email, try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // If token has not expired and user exists => set new password
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // Update changedPasswordAt prop at db and save user
  await user.save();

  // Log the user in => send JWT
  createSendToken(user, 200, req, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // Get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // Check if POSTed current pass is correct
  // noinspection JSUnresolvedVariable
  if (
    !user ||
    !(await user.correctPassword(req.body.passwordCurrent, user.password))
  )
    return next(new AppError('Invalid current password', 401));

  // if so => update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Log the user in => send JWT
  createSendToken(user, 200, req, res);
});
