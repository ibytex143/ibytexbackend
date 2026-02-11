const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Generate Unique Account ID
const generateAccountId = async () => {
  const random = Math.floor(10000 + Math.random() * 90000);
  return `#${random}`;
};

// SIGNUP
const signup = async (req, res) => {
  try {
    const { name, email, password, phone, telegramId } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All required fields must be filled",
        success: false,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
        success: false,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const accountId = await generateAccountId();

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
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
    res.status(500).json({
      message: "Signup failed",
      success: false,
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const errorMessage = "Invalid email or password";

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
