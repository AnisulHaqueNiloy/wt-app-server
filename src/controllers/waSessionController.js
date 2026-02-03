// controllers/waSessionController.js
const waService = require("../services/waSessionService");

/**
 * STEP 1: Create Session
 * ড্যাশবোর্ড থেকে নাম এবং নম্বর দিলে এই API কল হবে।
 */
const createSession = async (req, res) => {
  try {
    const { name, phoneNumber } = req.body;
    const userId = req.user._id; // Auth Middleware থেকে প্রাপ্ত

    if (!name || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Name and Phone Number are required",
      });
    }

    const session = await waService.createWASession(userId, name, phoneNumber);

    res.status(201).json({
      success: true,
      message: "Session initialized successfully",
      data: session,
    });
  } catch (error) {
    console.error(
      "Create Session Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message:
        error.response?.data?.message || "Failed to create WhatsApp session",
    });
  }
};

/**
 * STEP 2: Connect Session
 * "Connect Now" বাটনে ক্লিক করলে এই API কল হবে।
 */
const connectSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = await waService.connectWASession(sessionId);

    res.status(200).json({
      success: true,
      message: "Connection request sent to server",
      data: session,
    });
  } catch (error) {
    console.error(
      "Connect Session Error:",
      error.response?.data || error.message,
    );
    res.status(500).json({
      success: false,
      message: "Failed to initiate WhatsApp connection",
    });
  }
};

/**
 * STEP 3: Get QR & Status (For Polling)
 * ফ্রন্টএন্ড থেকে প্রতি ৫ সেকেন্ড পর পর এই API কল হবে।
 */
const getQRStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await waService.getQRAndCheckStatus(sessionId);

    // যদি অলরেডি কানেক্ট হয়ে যায়, সকেটে একটা ফাইনাল মেসেজ পাঠান
    if (session.status === "connected" && global.io) {
      global.io.emit(`session_connected_${sessionId}`, {
        message: "Your WhatsApp is now linked!",
      });
    }

    res.status(200).json({
      success: true,
      qrCode: session.qrCode,
      status: session.status,
      phoneNumber: session.phoneNumber,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching status" });
  }
};

const getApiKeyHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID is required" });
    }

    const result = await waService.getSecureApiKey(sessionId);

    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(403).json(result); // Forbidden যদি কানেক্টেড না থাকে
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// get all sessions

const getSessions = async (req, res) => {
  try {
    // এই টোকেনটি আপনার .env ফাইলে রাখা উচিত
    const token = process.env.WASENDER_TOKEN;
    const sessions = await waService.fetchAllWasenderSessions(token);

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const token = process.env.WASENDER_API_TOKEN;

    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "Session ID is required" });
    }

    const result = await waService.deleteWasenderSession(sessionId, token);

    res.status(200).json({
      success: true,
      message: "Session deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createSession,
  connectSession,
  getQRStatus,
  getApiKeyHandler,
  getSessions,
  removeSession,
};
