const axios = require("axios");

const Message = require("../models/Message");

const sendBulk = async (numbers, messageText, userId) => {
  const API_TOKEN = process.env.WASENDER_TOKEN;
  const API_URL = process.env.WASENDER_URL;

  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i];

    global.io.emit("msgStatus", { index: i, status: "sending" });

    try {
      const response = await axios.post(
        API_URL,
        {
          jid: `${number}@s.whatsapp.net`,
          text: "text",
          message: messageText,
        },
        {
          headers: { Authorization: `Bearer ${API_TOKEN}` },
        }
      );

      await Message.create({
        userId,
        phoneNumber: number,
        messageContent: messageText,
        status: "sent",
      });

      global.io.emit("msgStatus", { index: i, status: "sent" });
    } catch (error) {
      await Message.create({
        userId,
        phoneNumber: number,
        messageContent: messageText,
        status: "failed",
      });
      global.io.emit("msgStatus", { index: i, status: "failed" });
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
  global.io.emit("campaignFinished");
};
