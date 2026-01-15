const mongoose = require("mongoose");

const Messageschema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  phoneNumber: { type: String, required: true },
  messageContent: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "sent", "failed"],
    default: "pending",
  },
  sentAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", Messageschema);
