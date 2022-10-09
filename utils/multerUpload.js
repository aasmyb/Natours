const multer = require('multer');
const AppError = require('./appError');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    const err = new AppError('Not an image! Please upload only images', 400);
    cb(err, false);
  }
};

const uploader = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

module.exports = uploader;