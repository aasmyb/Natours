const Tour = require('../models/tourModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.handleAlerts = (req, res, next) => {
  const { alert } = req.query;

  if (alert === 'booking') {
    res.locals.alert =
      'Your booking was successful! Please check your email for a confirmation';
  }
  next();
};

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Render template using tour data
  res.status(200).render('overview', {
    title: 'All Tours',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });

  if (!tour) return next(new AppError('There is no tour with that name!', 404));

  // If there is a user => check if he booked tour
  if (res.locals.user) {
    tour.isBooked = await Booking.findOne({
      user: res.locals.user.id,
      tour: tour.id,
    });
  }

  // Render template using tour data
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  // Render template using tour data
  res.status(200).render('login', {
    title: 'log into your account',
  });
};

exports.getSignupForm = (req, res) => {
  // Render template using tour data
  res.status(200).render('signup', {
    title: 'Create new account',
  });
};

exports.getSuccess = (title, msg, btnTarget, btnText) => (req, res) => {
  // Render template using tour data
  res.status(200).render('success', {
    title,
    msg,
    btnTarget,
    btnText,
  });
};

exports.getAccount = (req, res) => {
  // Render template using tour data
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id });
  const toursIds = bookings.map(bookingEl => bookingEl.tour);
  const tours = await Tour.find({ _id: { $in: toursIds } });

  res.status(200).render('overview', {
    title: 'My Booked Tours',
    tours,
  });
});

exports.getForgotPasswordForm = (req, res) => {
  // Render template using tour data
  res.status(200).render('forgotPassword', {
    title: 'Forgot your password',
  });
};

exports.getResetPasswordForm = (req, res) => {
  // Render template using tour data
  res.status(200).render('resetPassword', {
    title: 'Reset your password',
  });
};
