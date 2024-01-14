import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema({
    videoFile:{
        type:String,  //// cloudinary se milayga ye
        required:true
    },
    thumbnail:{
        type:String, // cloudinary se milayga ye
        required:true
    },
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number, // cloudinary se milayga ye
        required:true
        // cloudinary pe jesay he video upload hogi wesay he hmy oski duration mil jayegi
    },
    views:{
        type:Number,
        default:0 // ye value by default dedo warna random values ajayengi
    },
    isPublish:{
        type:Boolean,
        default:true
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }





},{
    timestamps: true
})
videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Videos",videoSchema)