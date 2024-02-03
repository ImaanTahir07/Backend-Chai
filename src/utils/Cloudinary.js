import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFileOnCloudinary = async(localFilePath)=>{
    try {
        if (!localFilePath)return null;
            //upload file on cloudinary
            const response =  await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto" //===> means that jo bh file arahi h ossay detect krlo yahan pe hm specify bh karsaktay 
            //k file image h ya video lekin hmnay "auto" kardia means jo araha khudi detect karlo
             })
            // file upload successfully ab unlink kardo
            fs.unlinkSync(localFilePath)
            console.log(response.url); //ye url chaiye hoga hmy
            return response
    } catch (error) {
        fs.unlinkSync(localFilePath)
        // remove the locally saved temporary file as the upload operation gets failed
        return null;
    }
}

export {uploadFileOnCloudinary}