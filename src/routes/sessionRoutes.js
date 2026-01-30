// src/routes/authRoutes.js
const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const {
  getSessionStatus,
  getMySession,
  createNewSession,
} = require("../controllers/sessionController");
const { create } = require("../models/User");

const router = express.Router();

router.get("/status", protect, getSessionStatus);
// router.post("/create-session", protect, createNewSession);

module.exports = router;
