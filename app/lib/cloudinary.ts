/**
 * Cloudinary Upload Integration
 * Handles image uploads using Cloudinary (FREE tier)
 * No authentication required for unsigned uploads
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: any[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder: string;
  original_filename: string;
}

/**
 * Generate timestamp for Cloudinary upload
 * @returns Current timestamp
 */
export function getCloudinaryTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Get Cloudinary upload URL for direct uploads
 * @returns Upload URL
 */
export function getCloudinaryUploadUrl(): string {
  return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}

/**
 * Upload file to Cloudinary from FormData
 * This method is for server-side uploads (private uploads)
 * @param file - File to upload
 * @param folder - Optional folder name in Cloudinary
 * @returns Upload response with URL
 */
export async function uploadToCloudinary(
  file: File,
  folder: string = "calprabhakar"
): Promise<CloudinaryUploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");
    formData.append("folder", folder);

    const response = await fetch(getCloudinaryUploadUrl(), {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    const data: CloudinaryUploadResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    throw error;
  }
}

/**
 * Transform Cloudinary URL with optimizations
 * @param url - Original Cloudinary URL
 * @param width - Image width
 * @param height - Image height
 * @param quality - Image quality (auto, good, best)
 * @returns Optimized URL
 */
export function optimizeCloudinaryUrl(
  url: string,
  width?: number,
  height?: number,
  quality: "auto" | "good" | "best" = "auto"
): string {
  if (!url || !url.includes("cloudinary")) {
    return url;
  }

  // Transform URL: /upload/ → /upload/w_{width},h_{height},c_fill,q_{quality}/
  const transforms: string[] = [];

  if (width && height) {
    transforms.push(`w_${width}`, `h_${height}`, "c_fill");
  } else if (width) {
    transforms.push(`w_${width}`, "c_scale");
  } else if (height) {
    transforms.push(`h_${height}`, "c_scale");
  }

  if (quality !== "auto") {
    transforms.push(`q_${quality}`);
  }

  if (transforms.length === 0) {
    return url;
  }

  const transformString = transforms.join(",");
  return url.replace("/upload/", `/upload/${transformString}/`);
}

/**
 * Delete a file from Cloudinary
 * Requires server-side implementation with API credentials
 * @param publicId - Public ID of the resource in Cloudinary
 * @returns Success status
 */
export async function deleteFromCloudinary(publicId: string): Promise<boolean> {
  try {
    // This should be called from a server action, not directly from client
    // The actual deletion happens in API route
    const response = await fetch("/api/upload/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ publicId }),
    });

    if (!response.ok) {
      throw new Error(`Delete failed: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    throw error;
  }
}

/**
 * Get Cloudinary signed upload parameters
 * These are used for more secure server-initiated uploads
 * @returns Signed parameters
 */
export async function getCloudinarySignedParams() {
  try {
    const response = await fetch("/api/upload/sign", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error("Failed to get signed parameters");
    }

    return await response.json();
  } catch (error) {
    console.error("Error getting signed parameters:", error);
    throw error;
  }
}
