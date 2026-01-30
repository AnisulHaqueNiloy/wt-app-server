// routes/waRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { create } = require("../models/Session");
const {
  createSession,
  connectSession,
  getQRStatus,
} = require("../controllers/waSessionController");

router.post("/session/create", protect, createSession);
router.post("/session/connect", protect, connectSession);
router.get("/session/status/:sessionId", protect, getQRStatus);

module.exports = router;
