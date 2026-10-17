import { axiosSecure } from '@/api/axios';

export type AllowedUploadFolder =
  | 'gram2city/avatars'
  | 'gram2city/chat'
  | 'gram2city/parcels'
  | 'gram2city/cms'
  | 'gram2city/config';

export interface SignatureResponse {
  success: boolean;
  data: {
    signature: string;
    timestamp: number;
    apiKey: string;
    cloudName: string;
    folder: string;
  };
}

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Uploads a file directly to Cloudinary's CDN edge using a secure backend-signed signature.
 * Bypasses backend Node.js RAM entirely, protecting container memory ceilings from OOM spikes.
 *
 * @param file - Binary File from browser file input or dropzone
 * @param folder - Whitelisted Cloudinary target folder
 * @returns Resolves to Cloudinary HTTPS secure_url
 */
export async function uploadDirectToCloudinary(
  file: File,
  folder: AllowedUploadFolder = 'gram2city/chat',
): Promise<string> {
  // 1. Fetch authorized cryptographic signature from backend
  const sigRes = await axiosSecure.post<SignatureResponse>('/upload/signature', { folder });

  if (!sigRes.data?.success || !sigRes.data.data) {
    throw new Error('Failed to acquire secure upload signature from server');
  }

  const { signature, timestamp, apiKey, cloudName } = sigRes.data.data;

  // 2. Direct multipart upload to Cloudinary Edge API
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const uploadEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

  const uploadRes = await fetch(uploadEndpoint, {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    const errorBody = await uploadRes.text();
    console.error('Direct Cloudinary upload failed:', errorBody);
    throw new Error('Direct media upload to Cloudinary CDN failed');
  }

  const uploadResult = (await uploadRes.json()) as CloudinaryUploadResponse;

  if (!uploadResult?.secure_url) {
    throw new Error('Cloudinary response did not return a valid secure URL');
  }

  return uploadResult.secure_url;
}
