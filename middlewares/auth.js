const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // 🔥 BLOCK CHECK
    if (user.status === "Blocked") {
      return res.status(403).json({
        message: "Your account is blocked. Contact admin."
      });
    }

    req.user = user;
    next();

  } catch (err) {
    res.status(401).json({ message: "Token failed" });
  }
};