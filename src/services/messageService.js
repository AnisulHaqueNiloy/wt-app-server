
const axios = require("axios");
const Message = require("../models/Message");
const User = require("../models/User"); // User model lagbe token load korar jonno

const sendBulk = async (numbers, messageText, userId) => {
 
  const user = await User.findById(userId);

 
  const API_TOKEN = user?.waToken;

  if (!API_TOKEN) {
    console.error("❌ No API Token found for user:", userId);
    global.io.emit("error", {
      message: "Please set your Wasender API Key in Settings first!",
    });
    return;
  }

  const API_URL = "https://www.wasenderapi.com/api/send-message";

  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i];
    global.io.emit("msgStatus", { index: i, status: "sending" });

    try {
      const response = await axios.post(
        API_URL,
        {
          to: number,
          text: messageText,
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`, // Ekhon eta dynamic!
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      
      if (response.data.success === true || response.status === 200) {
        await Message.create({
          userId,
          phoneNumber: number,
          messageContent: messageText,
          status: "sent",
        });
        global.io.emit("msgStatus", { index: i, status: "sent" });
        console.log(`✅ Success for ${number}`);
      } else {
        throw new Error(response.data.message || "Failed");
      }
    } catch (error) {
      console.error(
        `❌ Error for ${number}:`,
        error.response?.data?.message || error.message
      );

      await Message.create({
        userId,
        phoneNumber: number,
        messageContent: messageText,
        status: "failed",
      });
      global.io.emit("msgStatus", { index: i, status: "failed" });
    }

    // WhatsApp ban thakate delay kora bhalo (5-10 seconds recommended)
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  global.io.emit("campaignFinished");
};

module.exports = { sendBulk };
