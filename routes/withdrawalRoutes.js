const express = require("express");
const router = express.Router();
const Withdrawal = require("../models/Withdrawal");
const Order = require("../models/Order");
const User = require("../models/User");
const authMiddleware = require("../middlewares/auth");
const adminMiddleware = require("../middlewares/adminAuth");




// ================= USER CREATE WITHDRAW REQUEST =================
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDetails } = req.body;

    // 1️⃣ Basic validation
    if (!amount || amount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    if (!paymentMethod || !paymentDetails)
      return res.status(400).json({ message: "Payment details required" });

    // 2️⃣ Calculate total sold (COMPLETED orders only)
    const orders = await Order.find({
      userId: req.user.id,
      status: "COMPLETED",
    });

    const totalSold = orders.reduce(
      (acc, curr) => acc + Number(curr.usdtAmount),
      0
    );

    // 3️⃣ Calculate already approved withdrawals
    const approvedWithdrawals = await Withdrawal.find({
      userId: req.user.id,
      status: "APPROVED",
    });

    const totalWithdrawn = approvedWithdrawals.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0
    );

    const availableBalance = totalSold - totalWithdrawn;

    // 4️⃣ Prevent over-withdraw
    if (Number(amount) > availableBalance)
      return res.status(400).json({ message: "Insufficient balance" });

    // 5️⃣ Create withdrawal with payment info
    const withdrawal = await Withdrawal.create({
      userId: req.user.id,
      amount: Number(amount),
      paymentMethod,
      paymentDetails,
    });

    res.json(withdrawal);
  } catch (err) {
    console.log("WITHDRAW CREATE ERROR:", err);
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
  try {
    console.log("Admin user:", req.admin);

   const withdrawals = await Withdrawal.find()
  .populate({
    path: "userId",
    model: "User"
  })
  .sort({ createdAt: -1 });


    res.json(withdrawals);
  } catch (err) {
    console.log("WITHDRAW ADMIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
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
