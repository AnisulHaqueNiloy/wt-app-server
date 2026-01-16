const axios = require("axios");
const Message = require("../models/Message");

const sendBulk = async (numbers, messageText, userId) => {
  const API_TOKEN = process.env.WASENDER_TOKEN;
  console.log(API_TOKEN);
  // URL ta oboshshoi slash (/) check koro
  const API_URL = "https://www.wasenderapi.com/api/send-message";

  for (let i = 0; i < numbers.length; i++) {
    const number = numbers[i];
    global.io.emit("msgStatus", { index: i, status: "sending" });

    try {
      const response = await axios.post(
        API_URL,
        {
          to: number, // number-ta '88017...' format-e thaklei hobe
          text: messageText, // messageText-ta ekhane jabe
        },
        {
          headers: {
            Authorization: `Bearer ${API_TOKEN}`, // Session API Key-ta .env theke ashbe
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (response.status === 200 || response.data.status === "success") {
        await Message.create({
          userId,
          phoneNumber: number,
          messageContent: messageText,
          status: "sent",
        });
        global.io.emit("msgStatus", { index: i, status: "sent" });
        console.log(`✅ Success for ${number}`);
      }
    } catch (error) {
      // Jodi 401 error dey, tobe bujhbe token vul jaygay boseche
      console.error(
        `❌ Error for ${number}:`,
        error.response?.data?.message || error.message
      );
      console.log(error.response);

      await Message.create({
        userId,
        phoneNumber: number,

        messageContent: messageText,
        status: "failed",
      });
      global.io.emit("msgStatus", { index: i, status: "failed" });
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  global.io.emit("campaignFinished");
};

module.exports = { sendBulk };
