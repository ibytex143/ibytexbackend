const mongoose = require("mongoose");

const payoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["BANK", "UPI"],
      required: true,
    },
    accountHolderName: String,
    accountNumber: String,
    ifsc: String,
    bankName: String,
    upiId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("PayoutMethod", payoutSchema);
