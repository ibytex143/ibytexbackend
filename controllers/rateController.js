const Rate = require("../models/Rate");

// SET RATE (ADMIN)
exports.setRate = async (req, res) => {
  try {
    const { rate } = req.body;

    let existing = await Rate.findOne();
    if (existing) {
      existing.rate = rate;
      await existing.save();
    } else {
      await Rate.create({ rate });
    }

    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({ message: "Rate update failed" });
  }
};

// GET RATE (USER + ADMIN)
exports.getRate = async (req, res) => {
  try {
    const data = await Rate.findOne();
    res.json({ rate: data ? data.rate : 0 });
  } catch (err) {
    res.status(500).json({ message: "Rate fetch failed" });
  }
};

module.exports = {
  setRate,
  getRate,
};