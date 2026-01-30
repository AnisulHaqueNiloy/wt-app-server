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

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const session = await waService.getQRAndCheckStatus(sessionId);

    // ফ্রন্টএন্ড এই ডাটা দেখে ডিসিশন নেবে
    res.status(200).json({
      success: true,
      qrCode: session.qrCode, // Base64 string
      status: session.status, // connected, pending, initializing etc.
      phoneNumber: session.phoneNumber,
    });
  } catch (error) {
    console.error("Status Check Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching session status",
    });
  }
};

module.exports = {
  createSession,
  connectSession,
  getQRStatus,
};
