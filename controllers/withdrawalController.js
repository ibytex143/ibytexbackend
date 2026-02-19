const Withdrawal = require("../models/Withdrawal");

// ================= TODAY STATS =================
const getTodayWithdrawStats = async (req, res) => {
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
      .reduce((sum, w) => sum + Number(w.amount || 0), 0);

    const successfulWithdrawAmount = withdrawals
      .filter(w => w.status === "APPROVED")
      .reduce((sum, w) => sum + Number(w.amount || 0), 0);

    res.json({
      totalWithdrawOrders,
      pendingWithdrawAmount,
      successfulWithdrawAmount,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ================= APPROVE =================
const approveWithdrawal = async (req, res) => {
  try {
    const { utrNumber } = req.body;

    const withdrawal = await Withdrawal.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ message: "Not found" });
    }

    withdrawal.status = "APPROVED";
    withdrawal.adminUtrNumber = utrNumber;
    withdrawal.approvedAt = new Date();

    await withdrawal.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Approve failed" });
  }
};

// ✅ EXPORT BOTH FUNCTIONS PROPERLY
module.exports = {
  getTodayWithdrawStats,
  approveWithdrawal,
};
