const Withdrawal = require("../models/Withdrawal");

exports.getTodayWithdrawStats = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const withdrawals = await Withdrawal.find({
      createdAt: { $gte: start, $lte: end },
    });

    const totalWithdrawOrders = withdrawals.length;

    const pendingWithdrawAmount = withdrawals
      .filter(w => w.status === "PENDING")
      .reduce((sum, w) => sum + w.amount, 0);

    const successfulWithdrawAmount = withdrawals
      .filter(w => w.status === "APPROVED")
      .reduce((sum, w) => sum + w.amount, 0);

    res.json({
      totalWithdrawOrders,
      pendingWithdrawAmount,
      successfulWithdrawAmount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};
