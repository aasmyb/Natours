const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { filterFeatures } = require('./../utils/apiFeatures');

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { data: newDoc },
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const query = populateOptions
      ? Model.findById(req.params.id).populate(populateOptions)
      : Model.findById(req.params.id);
    const doc = await query;
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // Hack solution for nested reviews
    const { tourId } = req.params;
    if (tourId) req.query.tour = tourId;

    // Execute query
    const features = filterFeatures(Model, req.query);
    const doc = await features.query;

    // View query stats
    // const doc = await features.query.explain();

    // Send response
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: { data: doc },
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { data: doc },
    });
  });

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });