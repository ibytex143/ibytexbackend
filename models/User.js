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
    status: {
  type: String,
  enum: ["Active", "Blocked"],
  default: "Active"
},

    // ✅ NEW FIELD (REQUIRED)
 phone: {
  type: String,
  required: true,
  unique: true,
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

otpVerified: {
  type: Boolean,
  default: false,
},

ipAddress: {
  type: String,
},

deviceInfo: {
  type: String,
},

city: {
  type: String,
},

country: {
  type: String,
},

lastActive: Date,
lastLoginIp: String,
lastLoginDevice: String,
lastLoginCity: String,
lastLoginCountry: String,

     
fcmTokens: {
  type: [String],
  default: [],
},
primaryDeviceToken: {
  type: String,
},


    // ✅ OPTIONAL
    telegramId: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
