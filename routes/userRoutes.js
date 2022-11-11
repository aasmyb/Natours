const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const validationController = require('../controllers/validationController');
const bookingRouter = require('./bookingRoutes');

const router = express.Router();

router.use('/:userId/bookings', bookingRouter);

router.post(
  '/signup',
  authController.preventLoggedIn,
  validationController.signupVal,
  authController.signup
);
router.get(
  '/confirmAccount/:token',
  authController.preventLoggedIn,
  authController.confirmAccountSignup
);
router.post(
  '/forgotPassword',
  authController.preventLoggedIn,
  authController.forgotPassword
);
router.patch(
  '/resetPassword/:token',
  authController.preventLoggedIn,
  authController.resetPassword
);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Protect all routes after this middleware => as in the end routers are middlewares
router.use(authController.protect);

router.patch('/updatePassword', authController.changePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch(
  '/updateMe',
  userController.uploadUserPhoto,
  userController.resizedUserPhoto,
  userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
