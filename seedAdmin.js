require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected for seeding");

    const exists = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (exists) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    await Admin.create({
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword, // ✅ HASHED
    });

    console.log("✅ Admin created successfully");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ DB error:", err.message);
    process.exit(1);
  });
