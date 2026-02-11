const { signup, login } = require('../controllers/AuthController');
const { signupValidation, loginValidation } = require('../middlewares/AuthValidtion');

const router = require('express').Router();

router.post('/login', loginValidation , login)
router.post('/signup', signupValidation , signup)



module.exports = router;