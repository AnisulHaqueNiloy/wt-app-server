// const axios = require("axios");
// const Message = require("../models/Message");

// const sendBulk = async (numbers, messageText, userId) => {
//   const API_TOKEN = process.env.WASENDER_TOKEN;
//   console.log(API_TOKEN);
//   // URL ta oboshshoi slash (/) check koro
//   const API_URL = "https://www.wasenderapi.com/api/send-message";

//   for (let i = 0; i < numbers.length; i++) {
//     const number = numbers[i];
//     global.io.emit("msgStatus", { index: i, status: "sending" });

//     try {
//       const response = await axios.post(
//         API_URL,
//         {
//           to: number, // number-ta '88017...' format-e thaklei hobe
//           text: messageText, // messageText-ta ekhane jabe
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${API_TOKEN}`, // Session API Key-ta .env theke ashbe
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//         }
//       );

//       if (response.status === 200 || response.data.status === "success") {
//         await Message.create({
//           userId,
//           phoneNumber: number,
//           messageContent: messageText,
//           status: "sent",
//         });
//         global.io.emit("msgStatus", { index: i, status: "sent" });
//         console.log(`✅ Success for ${number}`);
//       }
//     } catch (error) {
//       // Jodi 401 error dey, tobe bujhbe token vul jaygay boseche
//       console.error(
//         `❌ Error for ${number}:`,
//         error.response?.data?.message || error.message
//       );
//       console.log(error.response);

//       await Message.create({
//         userId,
//         phoneNumber: number,

//         messageContent: messageText,
//         status: "failed",
//       });
//       global.io.emit("msgStatus", { index: i, status: "failed" });
//     }
//     await new Promise((resolve) => setTimeout(resolve, 5000));
//   }
//   global.io.emit("campaignFinished");
// };

// module.exports = { sendBulk };
const axios = require("axios");
const Message = require("../models/Message");
const User = require("../models/User"); // User model lagbe token load korar jonno

const sendBulk = async (numbers, messageText, userId) => {
  // 1. Database theke oi specific user-er profile load koro
  const user = await User.findById(userId);

  // 2. User-er profile theke token-ta naw (Settings page-e jeta save koreche)
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

      // response status checking
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
