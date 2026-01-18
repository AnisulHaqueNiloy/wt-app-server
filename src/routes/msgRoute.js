const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  processBulkSMS,
  getHistory,
} = require("../controllers/messageController");
const { getAnalytics } = require("../controllers/messageAnalytcisController");
const router = express.Router();

router.post("/send-bulk", protect, processBulkSMS);
router.get("/history", protect, getHistory);
router.get("/analytics", protect, getAnalytics);

module.exports = router;
