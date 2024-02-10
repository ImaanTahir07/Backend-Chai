import {asyncHandler} from '../utils/async-Handler.js';
import {ApiError} from '../utils/ApiError.js'
import { User } from '../models/user.model.js';
import {uploadFileOnCloudinary} from '../utils/Cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from "jsonwebtoken";


const generateAccessAndRefreshToken = async(userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()  
        console.log(accessToken,refreshToken);
        // refresh token DB mai save hojyega 
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave : false})     
        
        return {accessToken , refreshToken}

                   
        
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access and refresh token!")
        
    }
}

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
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(409,"User with username or email already exists!")
    }

    // check for images, check for avatar
    console.log(req.files);
    const avatarLocalPath = req.files?.avatar[0]?.path
    let coverImageLocalPath ;
    if (req.files && Array.isArray(req.files.coverImage)&& req.files.coverImage.length > 0) {
        coverImageLocalPath=req.files.coverImage[0].path;
        
    }
    
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

const loginUser = asyncHandler(async(req,res)=>{
    // req.body -> data
    const {email,password,username} = req.body
    console.log("1")
    console.log(req.body)
    // username or email
    if (!username && !email) {
        throw new ApiError(400,"username or email is required")
    }
    console.log("2")
    console.log(username + email)
    // find user
    const user = await User.findOne({
        $or:[{email},{username}]
    })
    console.log(user)
    if (!user) {
        throw new ApiError(404,"User not exists.")
    }
    // password check
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401,"Invalid User Credentials!")
    }
    console.log(isPasswordValid)
    // access and refresh token
    const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id) //most frequently used functionality thats why iska method banadia
    const loggedInUser = await User.findOne(user._id)
    .select("-password -refreshToken")
    // send cookie
    const options = {
        httpOnly : true,
        secure : true
    }
    console.log(options)
    console.log(res.cookies)
    const response = res.status(200)
    .cookie("accessToken",accessToken,options) // app.js mai cookieParser ki property add kri thi na ossi se isko dkh paa rhay
    .cookie("refreshToken",refreshToken, options).json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken , refreshToken,

            },
            "User Logged in Successfully!"
        )
        

    )
    return response;
    
    
})

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: undefined // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    console.log("Req.user")
    console.log(req.user);
    console.log("Req.cookies")
    console.log(req.cookies);
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken){
        throw new ApiError(401, 'Unauthorized Request!')
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user){
            throw new ApiError(401, 'Invalid Refresh Token')
        }
        // here we are matching tokens for session to restart
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh Token is expired or used')
        }
        const options = {
            httpOnly: true,
            secure:true
        }
        const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)
        return res.status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken:newRefreshToken},
                "Access Token Refreshed Successfully!"
            )
        )
    
    } catch (error) {
        throw new ApiError(401,error?.message||'Invalid Refresh Token')
    }
    
})

export {registerUser,loginUser, logoutUser,refreshAccessToken} 