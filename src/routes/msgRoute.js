const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const {
  processBulkSMS,
  getHistory,
} = require("../controllers/messageController");
const router = express.Router();

router.post("/send-bulk", protect, processBulkSMS);
router.get("/history", protect, getHistory);

module.exports = router;
