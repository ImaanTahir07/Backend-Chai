import mongoose , {Schema} from "mongoose";
import  jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique: true,
        lowercase:true,
        trim:true,
        index:true, // for search purpose
    },
    email:{
        type:String,
        required:true,
        unique: true,
        lowercase:true,
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true

    },
    avatar:{
        type: String, // cloudinary
        required:true,

    },
    coverImage:{
        type: String, 
    },
    watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref:"Videos"
        }
    ],
    password:{
        type:String,
        required:[true,"Password is required"]
    },
    refreshToken:{
        type:String
    }


},{
    timestamps:true
})
// is tarha hm apnay schema mai predefine middlewares use krsaktay,
// schema mai apnay methods bh bana kar inject krwatay
// schema mai plugins bh use karsaktay
userSchema.pre("save",async function(next){
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next(); 
})
userSchema.methods.isPasswordCorrect = async function (password){
    return await bcrypt.compare(password,this.password)
}
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username: this.username,
        fullName : this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,{
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
    )
}
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id:this._id, // refresh token mai hmary pass kam info hoti hai 
        // or refresh token der se expire hota hai
    },
    process.env.REFRESH_TOKEN_SECRET,{
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
    )
}
export const User = mongoose.model("Users",userSchema)
