const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // Get tour data from collection
  const tours = await Tour.find();

  // Build template
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

  console.log(tour);
  // Build template
  // Render template using tour data
  res.status(200).render('tour', {
    title: tour.name,
    tour,
  });
});

exports.getLoginForm = catchAsync(async (req, res, next) => {
  // Build template
  // Render template using tour data
  res.status(200).render('login', {
    title: 'log into your account',
  });
});
