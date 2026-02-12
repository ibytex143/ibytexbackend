const News = require("../models/News");

// ADD
const addNews = async (req, res) => {
  try {
    const news = await News.create({ text: req.body.text });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "News add failed" });
  }
};

// GET
const getNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: "News fetch failed" });
  }
};

// EDIT
const updateNews = async (req, res) => {
  try {
    const updated = await News.findByIdAndUpdate(
      req.params.id,
      { text: req.body.text },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "News update failed" });
  }
};

// DELETE
const deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: "News delete failed" });
  }
};

module.exports = {
  addNews,
  getNews,
  updateNews,
  deleteNews,
};
