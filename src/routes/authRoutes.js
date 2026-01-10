// src/routes/authRoutes.js
const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  logout,
} = require("../controllers/authController"); // ধরে নেওয়া হচ্ছে এটি তৈরি করা আছে
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);
module.exports = router;