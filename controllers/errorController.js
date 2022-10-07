const AppError = require('./../utils/appError');

const renderError = (err, res) => {
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: err.message,
  });
};

const sendProdOperationalError = (err, req, res) => {
  // Operational errors which are trusted errors => we send it to client
  // Render Website
  if (!req.originalUrl.startsWith('/api')) renderError(err, res);
  else {
    // API
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
};

const sendProdProgrammingErrors = (err, req, res) => {
  // Programming or other unknown errors => don't leak error details
  // Render website
  if (!req.originalUrl.startsWith('/api')) {
    err.message = 'Something went very wrong! Please try again later.';
    renderError(err, res);
  } else {
    // API
    // 1) log error to server console
    console.log('Error 😡💢', err);
    // 2) send generic error message to user
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
  const dupValue = err.errmsg.match(/(?<=(["']\b))(?:(?=(\\?))\2.)*?(?=\1)/)[0];
  const message = `Duplicate field value: ${dupValue}, please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(errEl => errEl.message);
  const message = `Invalid input data; ${errors.join('. ')}.`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired, please log in again', 401);

const sendErrorDev = (err, req, res) => {
  // Render Website
  if (!req.originalUrl.startsWith('/api')) renderError(err, res);
  else {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }
};

const sendErrorProd = (err, req, res) => {
  if (err.code === 11000) {
    err = handleDuplicateFieldsDB(err);
  }
  if (err.name === 'CastError') {
    err = handleCastErrorDB(err);
  }
  if (err.name === 'ValidationError') {
    err = handleValidationErrorDB(err);
  }
  if (err.name === 'JsonWebTokenError') {
    err = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    err = handleJWTExpiredError();
  }
  if (err.isOperational) sendProdOperationalError(err, req, res);
  else sendProdProgrammingErrors(err, req, res);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, req, res);
  }
};
