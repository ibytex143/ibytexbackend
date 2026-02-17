const express = require("express");
const router = express.Router();
const { deleteOrder } = require("../controllers/orderController");
const { getTodayStats } = require("../controllers/orderController");


const upload = require("../middlewares/upload");
const adminAuth = require("../middlewares/adminAuth");
const userAuth = require("../middlewares/auth");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  completeOrder,
  getDashboardSummary,
  getHistoryByDate,
} = require("../controllers/orderController");

// USER
router.post(
  "/",
  userAuth,
  upload.single("receipt"),
  createOrder
);

// ================= USER DASHBOARD STATS =================
router.get("/user/stats", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today Completed USDT
    const todayOrders = await Order.find({
      userId,
      status: "COMPLETED",
      createdAt: { $gte: today },
    });

    const todayUSDT = todayOrders.reduce(
      (sum, o) => sum + o.usdtAmount,
      0
    );

    // Total Completed USDT
    const allOrders = await Order.find({
      userId,
      status: "COMPLETED",
    });

    const totalUSDT = allOrders.reduce(
      (sum, o) => sum + o.usdtAmount,
      0
    );

    // Recent 2 Orders
    const recentOrders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(2);

    res.json({
      todayUSDT,
      totalUSDT,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: "Stats failed" });
  }
});



router.get("/my", userAuth, getMyOrders);

// ADMIN
router.get("/admin", adminAuth, getAllOrders);
router.put("/complete/:id", adminAuth, completeOrder);
router.delete("/admin/:id", adminAuth, deleteOrder);
router.get("/admin/dashboard-summary", adminAuth, getDashboardSummary);
router.get("/admin/history", adminAuth, getHistoryByDate);
router.get("/admin/today-stats", adminAuth, getTodayStats);



module.exports = router;
