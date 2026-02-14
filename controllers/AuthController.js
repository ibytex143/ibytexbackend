const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate Unique Account ID
const generateAccountId = async () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `#${random}`;
};

// ================= SIGNUP =================
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, telegramId } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All required fields must be filled",
        success: false,
      });
    }

    // ✅ INTERNATIONAL PHONE VALIDATION
    // Accepts +85288797979, +918349742527, +12025550123 etc
    const phoneRegex = /^\+\d{8,15}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone number must include country code (example: +91)",
        success: false,
      });
    }

    // ✅ Check existing email OR phone
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or phone already registered",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountId = await generateAccountId();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone, // full international number saved
      telegramId,
      accountId,
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      success: true,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountId: user.accountId,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Signup failed",
      success: false,
    });
  }
};


// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    const otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    let user = existingUser;

    if (!user) {
      user = await User.create({
        email,
        otp,
        otpExpiry,
      });
    } else {
      user.otp = otp;
      user.otpExpiry = otpExpiry;
      user.otpAttempts = 0;
      await user.save();
    }

    await sendEmail(email, otp);

    res.json({ success: true, message: "OTP sent to email" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP send failed" });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Invalid request" });

    if (user.otpAttempts >= 5) {
      return res.status(429).json({ message: "Too many attempts. Try later." });
    }

    if (user.otp !== otp) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    user.isEmailVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    user.otpAttempts = 0;

    await user.save();

    res.json({ success: true, message: "Email verified" });

  } catch (err) {
    res.status(500).json({ message: "Verification failed" });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const errorMessage = "Invalid email or password";

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(403).json({
        message: errorMessage,
        success: false,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({
        message: errorMessage,
        success: false,
      });
    }

    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        accountId: user.accountId,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Login failed",
      success: false,
    });
  }
};

module.exports = {
  signup,
  login,
};
