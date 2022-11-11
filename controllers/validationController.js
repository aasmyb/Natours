const { check, validationResult } = require('express-validator');

exports.checkValidation = req => {
  let errorMessage;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    errorMessage = errors.array()[0].msg;
  }
  return errorMessage;
};

exports.signupVal = [
  check(
    ['email', 'name', 'password', 'passwordConfirm'],
    'You must fill all values!'
  )
    .notEmpty()
    .trim(),
  check('email', 'Please enter a valid email.').isEmail().normalizeEmail(),
  check('name', 'Please enter a valid name(more than 3 characters).').isLength({
    min: 3,
  }),
  check('password', 'A password can not be less than 8 characters.').isLength({
    min: 8,
  }),
  check('passwordConfirm').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }

    // Indicates the success of this synchronous custom validator
    return true;
  }),
];
