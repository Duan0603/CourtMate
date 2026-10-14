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
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'courtmate';
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'courtmate_avatars';

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
      console.warn('Cloudinary upload warning:', errorData);
      // Fallback: Read as base64 data URL for instant client responsiveness
      return await fileToDataUrl(file);
    }

    const data: CloudinaryUploadResponse = await res.json();
    return data.secure_url;
  } catch (err: any) {
    console.warn('Could not reach Cloudinary endpoint directly, using instant preview:', err.message);
    return await fileToDataUrl(file);
  }
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
