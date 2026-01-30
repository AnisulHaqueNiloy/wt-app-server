// models/WASession.js
const mongoose = require("mongoose");

const WASessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sessionId: { type: String, required: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    status: {
      type: String,
      enum: ["disconnected", "initializing", "pending", "connected"],
      default: "disconnected",
    },
    qrCode: { type: String, default: "" }, // Base64 string thakbe
  },
  { timestamps: true },
);

module.exports = mongoose.model("WASession", WASessionSchema);
