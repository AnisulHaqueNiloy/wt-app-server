const User = require("../models/User")

const updateWaToken = async(userId,token)=>{
    try{
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {waToken:token},
            {new:true,runValidators:true}
        )
        console.log(token)

        if(!updatedUser){
            throw new Error('User not found')
        }

        return updatedUser
    } catch(error){
        throw new Error(error.message)
    }
}

module.exports= updateWaToken