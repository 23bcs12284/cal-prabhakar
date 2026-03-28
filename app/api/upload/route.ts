/**
 * API route for handling Cloudinary uploads
 * Handles file uploads from client
 * Uses unsigned upload for simplicity (FREE tier compatible)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/app/lib/hooks";

export async function POST(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await requireUser();

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 4MB" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images allowed" },
        { status: 400 }
      );
    }

    // Prepare FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", file);
    cloudinaryFormData.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
    );
    cloudinaryFormData.append("folder", `calprabhakar/${session.user?.id}`);

    // Upload to Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    const uploadResponse = await fetch(cloudinaryUrl, {
      method: "POST",
      body: cloudinaryFormData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Cloudinary upload failed: ${uploadResponse.statusText}`);
    }

    const uploadData = await uploadResponse.json();

    return NextResponse.json({
      url: uploadData.secure_url,
      publicId: uploadData.public_id,
      width: uploadData.width,
      height: uploadData.height,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
