/**
 * API route for getting signed Cloudinary upload parameters
 * Used for more secure uploads (optional)
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/app/lib/hooks";

export async function POST(req: NextRequest) {
  try {
    // Ensure user is authenticated
    const session = await requireUser();

    // For unsigned uploads (free tier), return empty signature
    // For signed uploads, you would create signature here using:
    // crypto.createHash('sha1').update(query_string + API_SECRET).digest('hex')

    return NextResponse.json({
      timestamp: Math.floor(Date.now() / 1000),
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      // For unsigned upload, signature is not needed
      signature: null,
      folder: `calprabhakar/${session.user?.id}`,
    });
  } catch (error) {
    console.error("Sign error:", error);
    return NextResponse.json(
      { error: "Failed to get signature" },
      { status: 500 }
    );
  }
}
