
const {getWhatsAppSessionStatus} = require("../services/sessionService");

const getSessionStatus = async (req, res) => {
  try {
    // Service call (Ekhon ar token pass korte hobe na)
    const sessionInfo = await getWhatsAppSessionStatus();

    res.status(200).json({
      success: true,
      ...sessionInfo
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSessionStatus };