import {asyncHandler} from '../utils/async-Handler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadFileOnCloudinary} from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';

const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontend
    const {username,email,fullName,password} = req.body;
    console.log("email",email);

    // validation - not empty
    if (
        [username,email,fullName,password].some((field)=>field?.trim==="") // we can do it by if else
    ) {
        throw new ApiError(400,"All fields are required")
    }

    // check if user already exists: username, email
    const existedUser = User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409,"User with username or email already exists!")
    }
    // check for images, check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is required!")
    }
   
    // upload them to cloudinary
    const avatar = await uploadFileOnCloudinary(avatarLocalPath)
    const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)
    if (!avatar) {
        throw new ApiError(400,"Avatar file is required!")
    }
    // create user object, create entry in DB
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "", //agar cover image h tou path dedo nae h tou empty rehnay do
        email,
        password,
        username:username.toLowerCase()
    })
   
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken" //yahan pe hm wo cheezain letay hain jo hmy nae chaiye kion k is function ko apply krtay huay hmary pass automatically bydefault saray attributes select hojatay hain
    )
    // check for user creation
    if (!createdUser) {
        throw new ApiError(500,"Something went wrong!")
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200 , createdUser , "User Registered Successfully")
    )





})

export {registerUser} 