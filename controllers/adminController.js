// const Admin = require("../models/Admin");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// const adminLogin = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const admin = await Admin.findOne({ email });
//     if (!admin) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid admin credentials",
//       });
//     }

//     const isMatch = await bcrypt.compare(password, admin.password);
//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid admin credentials",
//       });
//     }

//     const token = jwt.sign(
//       { id: admin._id, role: "admin" },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     console.error("Admin login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Admin login failed",
//     });
//   }
// };
// console.log("JWT_SECRET:", process.env.JWT_SECRET);

// module.exports = {
//   adminLogin,
// };



const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");


const adminLogin = async (req, res) => {
  try {
    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("Body:", req.body);

    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    console.log("Admin found:", admin);

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      success: true,
      token,
    });

  } catch (error) {
    console.error("Admin login error FULL:", error);
    res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
};

const updateAdminCredentials = async (req, res) => {
  try {
    const { newEmail, newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await Admin.findOneAndUpdate(
      {},   // kyunki usually ek hi admin hota hai
      {
        email: newEmail,
        password: hashedPassword
      }
    );

    res.json({ message: "Admin updated successfully" });

  } catch (error) {
    res.status(500).json({ error: "Update failed" });
  }
};


module.exports = {
  adminLogin,
  updateAdminCredentials
};
