const Order = require("../models/Order");
const Withdrawal = require("../models/Withdrawal");
const User = require("../models/User");

// ================= GET ALL USERS WITH STATS =================
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    const userData = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({
          userId: user._id,
          status: "COMPLETED",
        });

        const totalUsdt = orders.reduce(
          (sum, order) => sum + (order.usdtAmount || 0),
          0
        );

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          accountId: user.accountId,
          phone: user.phone,
          telegramId: user.telegramId,
          isBlocked: user.isBlocked,
          registrationDate: user.createdAt,
          totalUsdt,
          totalOrders: orders.length,
        };
      })
    );

    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// ================= BLOCK / UNBLOCK =================
exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({ message: "User status updated" });
  } catch {
    res.status(500).json({ message: "Failed to update user" });
  }
};

// ================= DELETE USER =================
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Order.deleteMany({ userId: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch {
    res.status(500).json({ message: "Delete failed" });
  }
};



exports.getTodayActiveUsers = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // Get today's orders
    const todayOrders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("userId");

    // Get today's withdrawals
    const todayWithdrawals = await Withdrawal.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("userId");

    const userMap = {};

    // Process orders
    todayOrders.forEach((order) => {
      const userId = order.userId._id.toString();

      if (!userMap[userId]) {
        userMap[userId] = {
          user: order.userId,
          sellCount: 0,
          sellAmount: 0,
          withdrawCount: 0,
          withdrawAmount: 0,
        };
      }

      userMap[userId].sellCount += 1;
      userMap[userId].sellAmount += order.amount;
    });

    // Process withdrawals
    todayWithdrawals.forEach((withdraw) => {
      const userId = withdraw.userId._id.toString();

      if (!userMap[userId]) {
        userMap[userId] = {
          user: withdraw.userId,
          sellCount: 0,
          sellAmount: 0,
          withdrawCount: 0,
          withdrawAmount: 0,
        };
      }

      userMap[userId].withdrawCount += 1;
      userMap[userId].withdrawAmount += withdraw.amount;
    });

    res.json(Object.values(userMap));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};