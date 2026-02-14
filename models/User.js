const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true },

    accountId: {
      type: String,
      unique: true,
    },

    // ✅ NEW FIELD (REQUIRED)
 phone: {
  type: String,
  required: true,
  unique: true,
},
isBlocked: {
  type: Boolean,
  default: false,
},
otp: String,
otpExpiry: Date,
isEmailVerified: {
  type: Boolean,
  default: false,
},
otpAttempts: {
  type: Number,
  default: 0,
},


    // ✅ OPTIONAL
    telegramId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("users", userSchema);
