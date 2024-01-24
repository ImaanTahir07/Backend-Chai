// URL==> Uniform resource locator
// URI ==> Uniform resource identifier
// URN ==> Uniform resource Name


//require('dotenv').config()   // esy bh kar saktay lekin code ki consistency ko khrb krta ye
import dotenv from "dotenv" // ye hmy as soon as possible lgana 
//chaiye apni main file pe taa k jitnay bh environment variables banaye hain na wo project mai har jagah available hojayen
import connectDB from "./db/index.js";
import {app} from "./app.js"


dotenv.config({path: './env'})   //path of our env file
// env ko properly work krnay k liye hm kch extra piece of code package.json wali file mai dalnegay jahan dev command thi nodemon wali wahan pe add kardengay
// const app = express()

connectDB().then(
    ()=>{
        app.on("error",(error)=>{
            console.log(error);
            throw error
        })
        app.listen(process.env.PORT || 8000,()=>{
            console.log(`Server is running on ${process.env.PORT}`)
        })
    }
).catch((error)=>{
    console.log("MongoDB connection failed! "+error)
})














// database se jab bh bat kro try catch zaroor lagana hai

// first approach , Second in db folder
/*
(async()=>{
    try {
        await mongoose.connect(`${process.env.MONGO_DB_URI}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("Error: ",error)
            throw error
        }
        )
        app.listen(process.env.PORT,()=>{
            console.log("Server is running on port "+ process.env.PORT);
        })
    } catch (error) {
        console.error("Error: ",error)
        throw error
    }
})() //iffies

*/