const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

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
