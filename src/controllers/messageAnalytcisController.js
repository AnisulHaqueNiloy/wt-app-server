const { getMessageAnalytics } = require("../services/messageAnalytics");

const getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Service call kora
    const analyticsData = await getMessageAnalytics(userId);

    res.status(200).json({
      success: true,
      data: analyticsData
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnalytics };