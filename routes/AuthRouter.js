const { signup, login  } = require('../controllers/AuthController');
const { sendOtp, verifyOtp } = require("../controllers/AuthController");
const { signupValidation, loginValidation } = require('../middlewares/AuthValidtion');


const router = require('express').Router();

router.post('/login', loginValidation , login)
router.post('/signup', signupValidation , signup)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);



module.exports = router;