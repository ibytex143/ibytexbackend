const Order = require("../models/Order");

// ================= USER → CREATE ORDER =================
const createOrder = async (req, res) => {
  try {
    const {
      usdtAmount,
      rate,
      totalINR,
      paymentMethod,
      upiId,
      accountName,
      accountNumber,
      ifsc,
      accountType,
    } = req.body;

    const userPaymentDetails =
      paymentMethod === "UPI"
        ? { upiId }
        : { accountName, accountNumber, ifsc, accountType };

    const order = await Order.create({
      userId: req.user.id,
      usdtAmount,
      rate,
      totalINR,
      paymentMethod,
      userPaymentDetails,
      receiptUrl: req.file ? `/uploads/${req.file.filename}` : null,
      status: "PENDING",
      isDeletedByAdmin: false,
    });

    res.json({ success: true, orderId: order._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Order creation failed" });
  }
};

// ================= USER → GET MY ORDERS =================
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({
    createdAt: -1,
  });

  res.json(orders);
};

// ================= ADMIN → GET ALL ORDERS =================
const getAllOrders = async (req, res) => {
  const orders = await Order.find({ isDeletedByAdmin: false })
    .populate("userId", "name email accountId phone telegramId")
    .sort({ createdAt: -1 });

  res.json(orders);
};

// ================= ADMIN → COMPLETE ORDER =================
const completeOrder = async (req, res) => {
  const { utrNumber } = req.body;

  if (!utrNumber) {
    return res.status(400).json({ message: "UTR number required" });
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = "COMPLETED";
  order.adminUtrNumber = utrNumber;

  await order.save();

  res.json({ success: true });
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


module.exports = {
  createOrder,
  getMyOrders,
  getAllOrders,
  completeOrder,
  deleteOrder,
  getDashboardSummary,
  getHistoryByDate,
};
