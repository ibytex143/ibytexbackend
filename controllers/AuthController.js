const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const axios = require("axios");

// ================= GENERATE ACCOUNT ID =================
const generateAccountId = async () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `#${random}`;
};

// ================= SIGNUP =================
// ================= SIGNUP =================
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, telegramId } = req.body;

    // 🔒 Check if email verified
if (
  !global.otpStore ||
  !global.otpStore[email] ||
  !global.otpStore[email].verified
) {
  return res.status(400).json({
    success: false,
    message: "Please verify email first",
  });
}


    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All required fields must be filled",
        success: false,
      });
    }

    const phoneRegex = /^\+\d{8,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Phone number must include country code (example: +91)",
        success: false,
      });
    }

    const existingUser = await User.findOne({
      $or: [{ email }],
    });

    // ❌ If already verified user → block
    if (existingUser && existingUser.isEmailVerified) {
      return res.status(409).json({
        message: "Email already registered",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountId = await generateAccountId();

    let user;

    // 🔁 If user exists but NOT verified → overwrite
    if (existingUser) {
      user = existingUser;
      user.name = name;
      user.password = hashedPassword;
      user.phone = phone;
      user.telegramId = telegramId;
      user.accountId = accountId;
      user.isEmailVerified = true;
    } 
    // 🆕 If completely new user
    else {
      user = new User({
        name,
        email,
        password: hashedPassword,
        phone,
        telegramId,
        accountId,
        isEmailVerified: true,
      });
    }

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
// ================= SEND OTP =================
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // 🔐 Store OTP in memory (temporary store)
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = {
      otp,
      expiry: Date.now() + 5 * 60 * 1000,
    };

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "Ibytex",
          email: "noreplyibytex@gmail.com"
        },
        to: [{ email }],
        subject: "Your OTP Code",
        htmlContent: `
          <h2>Email Verification</h2>
          <h1>${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        `
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (err) {
    console.error("OTP ERROR:", err.response?.data || err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

// ================= FORGOT PASSWORD - SEND OTP =================
// ================= FORGOT PASSWORD - SEND OTP =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not registered",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await User.updateOne(
      { email },
      {
        $set: {
          otp,
          otpExpiry: Date.now() + 5 * 60 * 1000,
        },
      }
    );

    await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Ibytex", email: "noreplyibytex@gmail.com" },
        to: [{ email }],
        subject: "Reset Password OTP",
        htmlContent: `
          <h2>Password Reset OTP</h2>
          <h1>${otp}</h1>
          <p>This OTP will expire in 5 minutes.</p>
        `,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      message: "Reset OTP sent successfully",
    });

  } catch (err) {
    console.error("FORGOT ERROR:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to send reset OTP",
    });
  }
};



// ================= VERIFY RESET OTP =================
const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || !user.otp) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested",
      });
    }

    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    await User.updateOne(
      { email },
      { $set: { otpVerified: true } }
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    res.status(500).json({
      success: false,
      message: "OTP verification failed",
    });
  }
};

  


// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.otpVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify OTP first",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updateOne(
      { email },
      {
        $set: { password: hashedPassword },
        $unset: { otp: "", otpExpiry: "", otpVerified: "" }
      }
    );

    return res.json({
      success: true,
      message: "Password reset successful",
    });

  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};





// ================= VERIFY OTP =================
// ================= VERIFY OTP =================
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!global.otpStore || !global.otpStore[email]) {
      return res.status(400).json({
        success: false,
        message: "OTP not requested",
      });
    }

    const stored = global.otpStore[email];

    if (Date.now() > stored.expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    if (stored.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ✅ Mark email verified in memory
    global.otpStore[email].verified = true;

    return res.json({
      success: true,
      message: "Email verified successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Verification failed",
    });
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

    // 🔥 BLOCK CHECK (MUST BE HERE)
    if (user.status === "Blocked") {
      return res.status(403).json({
        message: "Your account is blocked by admin",
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
  sendOtp,
  verifyOtp,
  forgotPassword,
  verifyResetOtp,
  resetPassword
};

