const AppError = require('./../utils/appError');

const sendProdOperationalError = (err, res) => {
  // Operational errors which are trusted errors => we send it to client
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

const sendProdProgrammingErrors = (err, res) => {
  // Programming or other unknown errors => don't leak error details
  // 1) log error to server console
  console.log('Error 😡💢', err);
  // 2) send generic error message to user
  res.status(500).json({
    status: 'error',
    message: 'Something went very wrong!',
  });
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

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  let error = { ...err };
  if (err.code === 11000) {
    error = handleDuplicateFieldsDB(err);
  }
  if (err.name === 'CastError') {
    error = handleCastErrorDB(err);
  }
  if (err.name === 'ValidationError') {
    error = handleValidationErrorDB(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }
  if (error.isOperational) sendProdOperationalError(error, res);
  else sendProdProgrammingErrors(error, res);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
