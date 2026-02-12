const User = require("../models/User");
const Order = require("../models/Order");

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
