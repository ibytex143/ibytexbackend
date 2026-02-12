const express = require("express");
const router = express.Router();
const { deleteOrder } = require("../controllers/orderController");

const upload = require("../middlewares/upload");
const adminAuth = require("../middlewares/adminAuth");
const userAuth = require("../middlewares/auth");

const {
  createOrder,
  getMyOrders,
  getAllOrders,
  completeOrder,
} = require("../controllers/orderController");

// USER
router.post(
  "/",
  userAuth,
  upload.single("receipt"), 
  createOrder
);

router.get("/my", userAuth, getMyOrders);

// ADMIN
router.get("/admin", adminAuth, getAllOrders);
router.put("/complete/:id", adminAuth, completeOrder);
router.delete("/admin/:id", adminAuth, deleteOrder);

module.exports = router;
