/**
 * Cloudinary Client Utility for CourtMate
 * Handles direct unsigned image uploads or falls back cleanly to local data preview.
 */

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'datmsosje';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'courtmate';

  // Check file size (limit 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Kích thước ảnh không được vượt quá 5MB');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'courtmate/users');

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      console.error('Cloudinary upload error:', errorData);
      throw new Error(errorData?.error?.message || 'Upload thất bại');
    }

    const data: CloudinaryUploadResponse = await res.json();
    return data.secure_url;
  } catch (err: any) {
    console.error('Cloudinary upload failed:', err);
    throw err;
  }
}
