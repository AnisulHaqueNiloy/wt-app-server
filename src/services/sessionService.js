const axios = require("axios");
dotenv = require("dotenv").config();

const getWhatsAppSessionStatus = async () => {
  try {
    // Direct env theke token nawa hochche
    const apiToken = process.env.WASENDER_API_TOKEN;

    if (!apiToken) {
      throw new Error("WASENDER_API_TOKEN is missing in .env file");
    }

    const response = await axios.get("https://www.wasenderapi.com/api/whatsapp-sessions", {
      headers: {
        'Authorization': `Bearer ${apiToken.trim()}`,
        'Accept': 'application/json'
      }
    });

    const sessions = response.data?.data || [];
    const mainSession = sessions[0]; 
    console.log(mainSession)

    return {
      status: mainSession?.status || "disconnected",
      number: mainSession?.phone_number || "Not Linked"
    };
  } catch (error) {
    console.error("Wasender Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || "Invalid API Token or Connection Error");
  }
};

module.exports = { getWhatsAppSessionStatus};