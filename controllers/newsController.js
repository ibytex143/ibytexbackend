const News = require("../models/News");

// ADD
exports.addNews = async (req, res) => {
  try {
    const news = await News.create({ text: req.body.text });
    res.json(news);
  } catch {
    res.status(500).json({ message: "News add failed" });
  }
};

// GET
exports.getNews = async (req, res) => {
  const news = await News.find().sort({ createdAt: -1 });
  res.json(news);
};

// ✏️ EDIT
exports.updateNews = async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true }
    );
    res.json(updated);
  } catch {
    res.status(500).json({ message: "News update failed" });
  }
};

// 🗑️ DELETE
exports.deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "News delete failed" });
  }
};
