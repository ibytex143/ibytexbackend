const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    usdtAmount: Number,
    rate: Number,
    totalINR: Number,

    payoutMethodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayoutMethod",
      required: true,
    },

    // 🔥 STORE UTR HERE
    adminUtrNumber: {
      type: String,
    },
    adminNotes: {
      type: String,
    },

    receiptUrl: String,
    isDeletedByAdmin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED"],
      default: "PENDING",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
