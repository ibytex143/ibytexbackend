const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/Withdrawal");
const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");


// ================= USER CREATE WITHDRAW REQUEST =================
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    // Calculate user available balance (only completed orders)
    const orders = await Order.find({
      userId: req.user.id,
      status: "COMPLETED",
    });

    const totalSold = orders.reduce(
      (acc, curr) => acc + Number(curr.usdtAmount),
      0
    );

    const approvedWithdrawals = await Withdrawal.find({
      userId: req.user.id,
      status: "APPROVED",
    });

    const totalWithdrawn = approvedWithdrawals.reduce(
      (acc, curr) => acc + curr.amount,
      0
    );

    const availableBalance = totalSold - totalWithdrawn;

    if (amount > availableBalance)
      return res.status(400).json({ message: "Insufficient balance" });

    const withdrawal = await Withdrawal.create({
      userId: req.user.id,
      amount,
    });

    res.json(withdrawal);
  } catch (err) {
    res.status(500).json({ message: "Withdrawal failed" });
  }
});


// ================= USER GET MY WITHDRAWALS =================
router.get("/my", authMiddleware, async (req, res) => {
  const withdrawals = await Withdrawal.find({
    userId: req.user.id,
  }).sort({ createdAt: -1 });

  res.json(withdrawals);
});


// ================= ADMIN GET ALL WITHDRAW REQUESTS =================
router.get("/admin", adminMiddleware, async (req, res) => {
  const withdrawals = await Withdrawal.find()
    .populate("userId")
    .sort({ createdAt: -1 });

  res.json(withdrawals);
});


// ================= ADMIN APPROVE =================
router.put("/approve/:id", adminMiddleware, async (req, res) => {
  await Withdrawal.findByIdAndUpdate(req.params.id, {
    status: "APPROVED",
  });

  res.json({ message: "Approved" });
});


// ================= ADMIN REJECT =================
router.put("/reject/:id", adminMiddleware, async (req, res) => {
  await Withdrawal.findByIdAndUpdate(req.params.id, {
    status: "REJECTED",
  });

  res.json({ message: "Rejected" });
});

module.exports = router;
