const Otp = require("../models/Otp");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");








// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "Email already registered" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.deleteMany({ email });

  await Otp.create({
    email,
    otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendEmail(email, otp);

  res.json({ success: true, message: "OTP sent to email" });
};

// ================= VERIFY OTP & SIGNUP =================
exports.verifyOtpAndSignup = async (req, res) => {
  const { name, email, password, phone, telegramId, otp } = req.body;

  const validOtp = await Otp.findOne({ email, otp });

  if (!validOtp)
    return res.status(400).json({ message: "Invalid OTP" });

  if (validOtp.expiresAt < new Date())
    return res.status(400).json({ message: "OTP expired" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phone,
    telegramId,
    accountId: `#${Math.floor(10000 + Math.random() * 90000)}`
  });

  await Otp.deleteMany({ email });

  res.json({ success: true, message: "Account created successfully" });
};
