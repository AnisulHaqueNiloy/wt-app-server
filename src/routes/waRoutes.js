// routes/waRoutes.js
const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/authMiddleware");
const { create } = require("../models/Session");
const {
  createSession,
  connectSession,
  getQRStatus,
  getApiKeyHandler,
  getAllSessions,
  getSessions,
  removeSession,
} = require("../controllers/waSessionController");
const { get } = require("mongoose");

router.post("/session/create", protect, createSession);
router.post("/session/connect", protect, connectSession);
router.get("/session/status/:sessionId", protect, getQRStatus);
router.get("/get-api-key/:sessionId", protect, getApiKeyHandler);
router.get("/whatsapp-sessions", protect, getSessions);
router.delete("/session/:sessionId", protect, removeSession);
module.exports = router;
