const {
  signup,
  login,
  sendOtp,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  checkEmail
} = require("../controllers/AuthController");
const { signupValidation, loginValidation } = require('../middlewares/AuthValidtion');
const express = require("express");
const auth = require("../middlewares/auth");
const User = require("../models/User");

const router = require('express').Router();

router.post('/login', loginValidation , login)
router.post('/signup', signupValidation , signup)
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.get("/check-email", checkEmail);

// 🔔 SAVE FCM TOKEN ROUTE
router.post("/save-fcm-token", auth, async (req, res) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "Token required" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      fcmToken,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("FCM SAVE ERROR:", err);
    res.status(500).json({ message: "Failed to save token" });
  }
});



module.exports = router;