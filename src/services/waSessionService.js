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
    const response = await axios.get(
      `${WASENDER_BASE_URL}/whatsapp-sessions/${sessionId}/qrcode`,
      { headers: getHeaders() },
    );

    console.log(response.data);

    const qr = response.data?.data?.qrCode;
    console.log("Fetched QR Code:", qr);

    return await WASession.findOneAndUpdate(
      { sessionId },
      { qrCode: qr, status: qr ? "pending" : "initializing" },
      { new: true },
    );
  } catch (error) {
    const currentSession = await WASession.findOne({ sessionId });
    return currentSession;
  }
};

module.exports = {
  createWASession,
  connectWASession,
  getQRAndCheckStatus,
};
