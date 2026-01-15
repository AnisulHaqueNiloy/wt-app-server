const Message = require("../models/Message");
const { sendBulk } = require("../services/messageService");

const processBulkSMS = async (req, res) => {
  const { numbers, message } = req.body;

  sendBulk(numbers, message, req.user.id);
  res.status(200).json({ success: true, message: "Broadcast Started" });
};

const getHistory = async (req, res) => {
  try {
    const history = (await Message.find({ userId: req.user.id })).toSorted({
      sentAt: -1,
    });
    res.status(200).json({ success: true, history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processBulkSMS, getHistory };
