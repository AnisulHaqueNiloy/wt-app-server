const updateWaToken = require("../services/userService");

const updateSetting = async(req,res)=>{
    try{
        const {waToken} = req.body
        const userId = req.user.id 

        if(!waToken){
            return res.status(400).json({
                success:false,
                message:"Your session token is required"
            })
        }

const user = await updateWaToken(userId, waToken);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: {
        waToken: user.waToken
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { updateSetting };