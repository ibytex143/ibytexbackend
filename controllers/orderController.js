const Order = require("../models/Order");

// ================= USER → CREATE ORDER =================
const createOrder = async (req, res) => {
  try {
    const { usdtAmount, rate, totalINR, payoutMethodId } = req.body;

    const order = await Order.create({
      userId: req.user._id,
      usdtAmount,
      rate,
      totalINR,
      payoutMethodId,
      receiptUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: "PENDING",
    });

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
};


// ================= USER → GET MY ORDERS =================
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id })
    .populate("payoutMethodId")  // 🔥 ADD THIS
    .sort({ createdAt: -1 });

  res.json(orders);
};


// ================= ADMIN → GET ALL ORDERS =================
const getAllOrders = async (req, res) => {
  const orders = await Order.find({ isDeletedByAdmin: false })
    .populate("userId", "name email accountId phone telegramId")
    .populate("payoutMethodId")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ================= ADMIN → COMPLETE ORDER =================
const completeOrder = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status required" });
    }

    if (!notes) {
      return res.status(400).json({ message: "Notes required" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔥 STATUS LOGIC
    if (status === "SUCCESS") {
      order.status = "COMPLETED";
    }

    if (status === "PENDING") {
      order.status = "PENDING";
    }

    if (status === "FAILED") {
      order.status = "FAILED";
    }

    // 🔥 SAVE NOTES (instead of UTR)
    order.adminNotes = notes;
    order.updatedAt = new Date();

    await order.save();

    res.json({ message: "Order updated successfully" });

  } catch (err) {
    console.log("ORDER COMPLETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ================= ADMIN → DELETE ORDER =================
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.isDeletedByAdmin = true;
    await order.save();

    res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
};

// ================= ADMIN DASHBOARD SUMMARY =================
const getDashboardSummary = async (req, res) => {
  try {
    const orders = await Order.find({ isDeletedByAdmin: false });

    const totalUsdtReceived = orders.reduce(
      (sum, o) => sum + (o.usdtAmount || 0),
      0
    );

    const totalPendingInr = orders
      .filter((o) => o.status === "PENDING")
      .reduce((sum, o) => sum + (o.totalINR || 0), 0);

    const totalSuccessfulInr = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + (o.totalINR || 0), 0);

    const totalOrders = orders.length;

    res.json({
      totalUsdtReceived,
      totalPendingInr,
      totalSuccessfulInr,
      totalOrders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard summary failed" });
  }
};

// ================= ADMIN HISTORY BY DATE =================
const getHistoryByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      isDeletedByAdmin: false,
    })
      .populate("userId", "name email phone accountId telegramId")
      .sort({ createdAt: -1 });

    const totalUsdt = orders.reduce(
      (sum, o) => sum + (o.usdtAmount || 0),
      0
    );

    const totalInrPaid = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + (o.totalINR || 0), 0);

    res.json({
      totalUsdt,
      totalInrPaid,
      orders,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "History fetch failed" });
  }
};
// ================= ADMIN DASHBOARD STATS =================
const getTodayStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await Order.find({
      createdAt: { $gte: today, $lt: tomorrow },
      isDeletedByAdmin: false,
    });

    const totalUsdt = orders.reduce(
      (sum, o) => sum + Number(o.usdtAmount || 0),
      0
    );

    const pendingPayment = orders
      .filter((o) => o.status === "PENDING")
      .reduce((sum, o) => sum + Number(o.totalINR || 0), 0);

    const successfulPayment = orders
      .filter((o) => o.status === "COMPLETED")
      .reduce((sum, o) => sum + Number(o.totalINR || 0), 0);

    res.json({
      totalUsdt,
      pendingPayment,
      successfulPayment,
      totalOrders: orders.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stats fetch failed" });
  }
};



module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  completeOrder,
  deleteOrder,
  getDashboardSummary,
  getHistoryByDate,
  getTodayStats,
  
};
