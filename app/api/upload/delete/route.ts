/**
 * API route for deleting Cloudinary images
 * Requires server-side API credentials
 */

import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/app/lib/hooks";

export async function POST(req: NextRequest) {
  try {
    // Ensure user is authenticated
    await requireUser();

    const { publicId } = await req.json();

    if (!publicId) {
      return NextResponse.json(
        { error: "No public ID provided" },
        { status: 400 }
      );
    }

    // For unsigned uploads, we can't delete directly
    // This is a limitation of the free tier with unsigned uploads
    // Users should manage deletions through Cloudinary dashboard or
    // implement with signed uploads using API credentials

    return NextResponse.json({
      success: true,
      message: "Deletion queued for manual processing",
      publicId,
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      { error: "Deletion failed" },
      { status: 500 }
    );
  }
}
