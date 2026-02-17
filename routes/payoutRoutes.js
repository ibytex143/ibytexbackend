const express = require("express");
const router = express.Router();
const Payout = require("../models/PayoutMethod");
const auth = require("../middlewares/auth");

// CREATE
// CREATE (Only 1 UPI & 1 BANK allowed per user)
router.post("/", auth, async (req, res) => {
  try {
    const { type } = req.body;

    // Check if same type already exists
    const existing = await Payout.findOne({
      userId: req.user.id,
      type: type,
    });

    if (existing) {
      return res.status(400).json({
        message: `You already added a ${type} method`,
      });
    }

    const payout = await Payout.create({
      ...req.body,
      userId: req.user.id,
    });

    res.json(payout);
  } catch (err) {
    res.status(500).json({ message: "Failed to add payout" });
  }
});


// GET USER METHODS
router.get("/", auth, async (req, res) => {
  const methods = await Payout.find({ userId: req.user.id });
  res.json(methods);
});

// UPDATE
router.put("/:id", auth, async (req, res) => {
  const updated = await Payout.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(updated);
});

// DELETE
router.delete("/:id", auth, async (req, res) => {
  await Payout.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

module.exports = router;
