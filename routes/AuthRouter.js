const {
  signup,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} = require("../controllers/AuthController");
const { signupValidation, loginValidation } = require('../middlewares/AuthValidtion');


const router = require('express').Router();

router.post('/login', loginValidation , login)
router.post('/signup', signupValidation , signup)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);



module.exports = router;