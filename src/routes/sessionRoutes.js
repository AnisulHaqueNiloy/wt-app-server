// src/routes/authRoutes.js
const express = require("express");

const { protect } = require("../middlewares/authMiddleware");
const { getSessionStatus } = require("../controllers/sessionController");

const router = express.Router();

router.get("/status", protect, getSessionStatus);

module.exports = router;