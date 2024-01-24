import {asyncHandler} from '../utils/async-Handler.js';

const registerUser = asyncHandler(async(req,res)=>{
     res.status(200).json({
        message:"Success!!"
    })
})

export {registerUser} 