import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async()=>{
    try {
        const connectionInstance = 
        await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
        // mongoose apko return mai ik object deta hai tou you can store it in variable
        console.log(`Database Connected Successfully!! DB HOST: ${connectionInstance.connection.host}`);
        
    } catch (error) {
        console.log("Error connecting to database: ", error);
        process.exit(1);
        
    }
}


export default connectDB