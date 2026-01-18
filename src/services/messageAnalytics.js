const mongoose = require("mongoose");
const Message = require("../models/Message");

const getMessageAnalytics = async (userId) => {
  try {
    // String userId-ke MongoDB ObjectId-te convert kora
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const stats = await Message.aggregate([
      { 
        $match: { userId: userObjectId } // Ekhon match korbe 100%
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        },
      },
    ]);

    const result = stats[0] || { total: 0, sent: 0, failed: 0, pending: 0 };
    
    const successRate = result.total > 0 
      ? ((result.sent / result.total) * 100).toFixed(1) 
      : "0";

    return {
      totalMessages: result.total,
      delivered: result.sent,
      failed: result.failed,
      successRate: successRate + "%",
      pending: result.pending
    };
  } catch (error) {
    throw new Error("Analytics Service Error: " + error.message);
  }
};

module.exports = {
  // baki service gulo...
  getMessageAnalytics,
};