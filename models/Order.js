const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },

    usdtAmount: Number,
    rate: Number,
    totalINR: Number,

    paymentMethod: {
      type: String,
      enum: ["UPI", "BANK"],
    },

    userPaymentDetails: {
      upiId: String,
      accountName: String,
      accountNumber: String,
      ifsc: String,
      accountType: String,
    },

    // 🔥 STORE UTR HERE
    adminUtrNumber: {
      type: String,
    },
    
    receiptUrl: String,
     isDeletedByAdmin: {
  type: Boolean,
  default: false,
}
,
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
