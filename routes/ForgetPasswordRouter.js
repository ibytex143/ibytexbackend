const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

  // 🔔 Later: send this link via email
  console.log("Reset link:", resetLink);

  res.json({
    success: true,
    message: "Reset link generated",
  });
};
