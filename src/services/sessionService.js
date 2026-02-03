const axios = require("axios");
dotenv = require("dotenv").config();
const WASession = require("../models/Session");

const getWhatsAppSessionStatus = async () => {
  try {
    // Direct env theke token nawa hochche
    const apiToken = process.env.WASENDER_API_TOKEN;

    if (!apiToken) {
      throw new Error("WASENDER_API_TOKEN is missing in .env file");
    }

    const response = await axios.get(
      "https://www.wasenderapi.com/api/whatsapp-sessions",
      {
        headers: {
          Authorization: `Bearer ${apiToken.trim()}`,
          Accept: "application/json",
        },
      },
    );

    const sessions = response.data?.data || [];
    const mainSession = sessions[0];
    console.log(mainSession);

    return {
      status: mainSession?.status || "disconnected",
      number: mainSession?.phone_number || "Not Linked",
      api_key: mainSession?.api_key || "N/A",
      id: mainSession?.id || "N/A",
    };
  } catch (error) {
    console.error("Wasender Error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.message || "Invalid API Token or Connection Error",
    );
  }
};

module.exports = { getWhatsAppSessionStatus };
