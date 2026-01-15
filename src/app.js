// src/app.js
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { notFound, errorHandler } = require("./middlewares/errorHandler");
const authRoutes = require("./routes/authRoutes");
const msgRoutes = require("./routes/msgRoute");

const app = express();

// --- Core Middlewares ---
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://your-frontend-domain.com",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    credentials: true,
  })
);

// --- Test Route ---
app.get("/", (req, res) => {
  res.send("Message sender Server is running");
});

// --- Routes Integration ------

app.use("/api/auth", authRoutes);
app.use("/api/message", msgRoutes);

// Error handling middlewares

app.use(notFound);
// 2. Global Error Handler
app.use(errorHandler);

module.exports = app;
