import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder: "car_api",
    });
    // file has been uploaded successfully
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    return null;
  }
};

const deleteFromCloudinary = async (cloudinaryUrl) => {
  try {
    if (!cloudinaryUrl) return null;

    // Extract public_id from URL
    // e.g. https://res.cloudinary.com/demo/image/upload/v1234567890/folder/sample.jpg -> folder/sample
    const urlParts = cloudinaryUrl.split('/');
    const versionIndex = urlParts.findIndex(part => part.startsWith('v') && !isNaN(part.substring(1)));

    let publicId = '';
    if (versionIndex !== -1) {
      const publicIdWithExtension = urlParts.slice(versionIndex + 1).join('/');
      publicId = publicIdWithExtension.split('.')[0];
    } else {
      // Fallback
      const publicIdWithExtension = urlParts.slice(-2).join('/');
      publicId = publicIdWithExtension.split('.')[0];
    }

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (error) {
    console.error("Error deleting from cloudinary:", error);
  }
};

export { cloudinary, uploadOnCloudinary, deleteFromCloudinary };
