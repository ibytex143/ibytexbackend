const router = require("express").Router();
const adminAuth = require("../middlewares/adminAuth");
const { adminLogin } = require("../controllers/adminController");
const { setRate, getRate } = require("../controllers/rateController");
const { addNews, getNews, updateNews , deleteNews } = require("../controllers/newsController");
const withdrawalController = require("../controllers/withdrawalController");
const {
  getAllUsers,
  toggleBlockUser,
  deleteUser,
  getTodayActiveUsers
} = require("../controllers/adminUserController");

// ADMIN LOGIN
router.post("/login", adminLogin);

// RATE CONTROL
router.post("/rate", adminAuth, setRate);
router.get("/rate", getRate);

// NEWS
router.post("/news", adminAuth, addNews);
router.get("/news", getNews);

// edit and delete routes
router.put("/news/:id", adminAuth, updateNews);   
router.delete("/news/:id", adminAuth, deleteNews);
 
// USERS
// ================= USERS =================
router.get("/users", adminAuth, getAllUsers);
router.put("/users/block/:id", adminAuth, toggleBlockUser);
router.delete("/users/:id", adminAuth, deleteUser);

router.get(
  "/withdrawal/admin/today-stats",
  adminAuth,
  withdrawalController.getTodayWithdrawStats
);
router.get(
  "/withdrawal/history",
  adminAuth,
  withdrawalController.getWithdrawalHistoryByDate
);
router.get(
  "/active-users/today",
  adminAuth,
  getTodayActiveUsers
);

router.put("/update-credentials", updateAdminCredentials);


module.exports = router;
