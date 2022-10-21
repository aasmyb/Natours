const express = require('express');
const viewController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(viewController.handleAlerts);

router.get('/me', authController.protect, viewController.getAccount);
router.get('/my-tours', authController.protect, viewController.getMyTours);

router.use(authController.isLoggedIn);
router.get('/', viewController.getOverview);
router.get('/tour/:slug', viewController.getTour);
router.get('/login', viewController.getLoginForm);
router.get('/signup', viewController.getSignupForm);
router.get('/forgotPassword', viewController.getForgotPasswordForm);
router.get('/resetPassword/:token', viewController.getResetPasswordForm);
router.get(
  '/signup/confirm/:token',
  viewController.getSuccess(
    'Confirmation',
    'Congratulations! your account is now confirmed',
    '/',
    'Explore Tours!'
  )
);

module.exports = router;
