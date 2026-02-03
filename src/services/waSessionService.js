const axios = require("axios");
const WASession = require("../models/Session");

const WASENDER_BASE_URL = "https://www.wasenderapi.com/api";
const Token = process.env.WASENDER_API_TOKEN;


const getHeaders = () => ({
  Authorization: `Bearer ${Token.trim()}`,
  Accept: "application/json",
});

/**

 */
const createWASession = async (userId, name, phoneNumber) => {
  // ১. WASender API-তে সেশন তৈরি
  const response = await axios.post(
    `${WASENDER_BASE_URL}/whatsapp-sessions`,
    {
      name: name,
      phone_number: phoneNumber,
      account_protection: true,
    },
    { headers: getHeaders() },
  );

  const sessionIdFromAPI = response.data.data.id;


  return await WASession.findOneAndUpdate(
    { userId: userId },
    {
      sessionId: sessionIdFromAPI,
      name,
      phoneNumber,
      status: "disconnected",
      qrCode: "",
    },
    { upsert: true, new: true },
  );
};

/**

 */
const connectWASession = async (sessionId) => {
  await axios.post(
    `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}/connect`,
    {},
    { headers: getHeaders() },
  );

  return await WASession.findOneAndUpdate(
    { sessionId },
    { status: "initializing" },
    { new: true },
  );
};

/**

 */
const getQRAndCheckStatus = async (sessionId) => {
  try {
    console.log(`--- Checking Status for Session: ${sessionId} ---`);

    const response = await axios.get(
      `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}/qrcode`,
      { headers: getHeaders() },
    );

   
    console.log("WASender API Response Data:", response.data);

    const qr = response.data?.data?.qrCode;
    const status = response.data?.data?.status;

    console.log(`Current Status from API: ${status}`);
    if (qr) console.log("QR Code received from API.");

    const updatedSession = await WASession.findOneAndUpdate(
      { sessionId },
      { qrCode: qr, status: status || (qr ? "pending" : "initializing") },
      { new: true },
    );

   
    if (global.io) {
      console.log(`Emitting Socket Event: session_update_${sessionId}`);
      console.log(`Socket Payload: { status: ${updatedSession.status} }`);

      global.io.emit(`session_update_${sessionId}`, {
        status: updatedSession.status,
        qrCode: updatedSession.qrCode,
      });
    } else {
      console.warn("Socket.io (global.io) is NOT initialized!");
    }

    return updatedSession;
  } catch (error) {
    console.error(
      "Error in getQRAndCheckStatus:",
      error.response?.data || error.message,
    );
    const currentSession = await WASession.findOne({ sessionId });
    return currentSession;
  }
};

const getSecureApiKey = async (sessionId) => {
  try {
  
    const session = await WASession.findOne({ sessionId });

    if (!session) {
      throw new Error("Session not found");
    }

   
    const response = await axios.get(
      `${process.env.WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.WASENDER_API_TOKEN}`,
          Accept: "application/json",
        },
      },
    );

    const remoteStatus = response.data?.data?.status;

   
    if (remoteStatus === "connected" || remoteStatus === "ready") {
      return {
        success: true,
        apiKey: session.api_Key || `WA_KEY_${session.sessionId}_SECURE`, // ডাটাবেসে থাকলে সেটা, নাহলে জেনারেট করা
        status: remoteStatus,
        message: "API Key fetched successfully",
      };
    } else {
      return {
        success: false,
        status: remoteStatus,
        message: "Device is not connected yet.",
      };
    }
  } catch (error) {
    console.error("Service Error:", error.message);
    throw error;
  }
};

const fetchAllWasenderSessions = async () => {
  try {
    const response = await axios.get(
      "https://www.wasenderapi.com/api/whatsapp-sessions",
      {
        headers: {
          Authorization: `Bearer ${Token}`,
        },
      },
    );
    return response.data; 
  } catch (error) {
    throw new Error("Wasender API calling failed!");
  }
};

const deleteWasenderSession = async (sessionId, token) => {
  try {
    const response = await axios.delete(
      `https://www.wasenderapi.com/api/whatsapp-sessions/${sessionId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message || "Wasender API Delete failed!";
    throw new Error(errorMessage);
  }
};

module.exports = {
  createWASession,
  connectWASession,
  getQRAndCheckStatus,
  getSecureApiKey,
  fetchAllWasenderSessions,
  deleteWasenderSession,
};
