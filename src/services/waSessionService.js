const axios = require("axios");
const WASession = require("../models/Session");

const WASENDER_BASE_URL = "https://www.wasenderapi.com/api";
const Token = process.env.WASENDER_API_TOKEN;

// হেডার ফাংশন যেখানে সরাসরি এনভায়রনমেন্ট টোকেন ব্যবহার করা হচ্ছে
const getHeaders = () => ({
  Authorization: `Bearer ${Token.trim()}`,
  Accept: "application/json",
});

/**
 * Step 1: WASender এ সেশন তৈরি এবং ডাটাবেসে সেভ
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

  // ২. ডাটাবেসে সেভ বা আপডেট করা
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
 * Step 2: সেশন কানেক্ট করার রিকোয়েস্ট পাঠানো
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

    // API থেকে আসা পুরো ডাটাটি দেখুন
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

    // সকেট পাঠানোর আগে ডাটা চেক করুন
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
    // ১. ডাটাবেস থেকে সেশনটি খুঁজে বের করা
    const session = await WASession.findOne({ sessionId });

    if (!session) {
      throw new Error("Session not found");
    }

    // ২. WASender API থেকে লেটেস্ট স্ট্যাটাস কনফার্ম করা
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

    // ৩. যদি কানেক্টেড থাকে তবেই কী (Key) রিটার্ন করা
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
    return response.data; // API থেকে আসা সব সেশন ডাটা
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
