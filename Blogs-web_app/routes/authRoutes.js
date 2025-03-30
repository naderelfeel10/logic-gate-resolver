const Router = require('express');
const authController = require('../controlers/authController');
const router = Router();

router.get('/signup', authController.signup_get);
router.post('/signup', authController.signup_post);

router.get('/login', authController.login_get);
router.post('/login', authController.login_post);


router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.get('/otp', authController.otp_get);
router.post('/otp', authController.otp_post);

//router.get('verifyEmail',authController.verifyEmail_get);
router.post('/verifyEmail',authController.verifyEmail);

router.get('/logout', authController.logout_get);


module.exports = router;