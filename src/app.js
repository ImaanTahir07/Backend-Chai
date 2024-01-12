import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import e from "cors";

const app = express();

app.use(cors({
    origin: process.env.CORS_URI
}))


// this config is when data is coming from json
app.use(express.json({limit: "16kb"})) // means express is accepting data in json and the limit of json data is 16 kb


app.use(express.urlencoded({  // this config is when data is coming from url 
    extended: true // not necessary
}))
export {app}