"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "drmpjeatm",
  api_key: "753935222523112",
  api_secret: "8kFUu8oQZNGeIjgZ6qlVvi9bTGc",
  secure: true,
});

export async function uploadToCloudinary(formData: FormData): Promise<string> {
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file uploaded");

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "nectar_products", resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        else resolve(result?.secure_url || "");
      }
    ).end(buffer);
  });
}
