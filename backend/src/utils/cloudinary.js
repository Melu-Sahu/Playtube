import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return new Error(
        "Cloudinary File Upload Error : Could not find the local path of file."
      );
    }

    // upload file on cloudinary

    const response = await cloudinary.uploader.upload(localFilePath, {
      public_id: "olympic_flag",
    });

    // console.log("Response", response);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the file from local saved file as the upload option got failed.
    return null;
  }             // finally we should unlilnk the file from our server, so we write it later. maybe some change need while learning
};

export { uploadOnCloudinary };
