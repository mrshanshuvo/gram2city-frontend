import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadDirectToCloudinary } from '@/lib/cloudinary';
import { axiosSecure } from '@/api/axios';

vi.mock('@/api/axios', () => ({
  axiosSecure: {
    post: vi.fn(),
  },
}));

describe('Cloudinary Direct Signed Upload Utility', () => {
  const mockFile = new File(['dummy binary image content'], 'photo.png', { type: 'image/png' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('orchestrates signature acquisition and direct Cloudinary upload successfully', async () => {
    vi.mocked(axiosSecure.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          signature: 'mock_sha1_signature',
          timestamp: 1729170000,
          apiKey: 'mock_api_key_123',
          cloudName: 'gram2city_cdn',
          folder: 'gram2city/chat',
        },
      },
    });

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValueOnce({
        secure_url: 'https://res.cloudinary.com/gram2city_cdn/image/upload/v1234/chat/photo.png',
        public_id: 'chat/photo',
        format: 'png',
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const resultUrl = await uploadDirectToCloudinary(mockFile, 'gram2city/chat');

    expect(axiosSecure.post).toHaveBeenCalledWith('/upload/signature', {
      folder: 'gram2city/chat',
    });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.cloudinary.com/v1_1/gram2city_cdn/auto/upload',
      expect.objectContaining({
        method: 'POST',
      }),
    );
    expect(resultUrl).toBe(
      'https://res.cloudinary.com/gram2city_cdn/image/upload/v1234/chat/photo.png',
    );
  });

  it('throws an error if backend signature acquisition fails', async () => {
    vi.mocked(axiosSecure.post).mockResolvedValueOnce({
      data: {
        success: false,
        message: 'Signature generation denied',
      },
    });

    await expect(uploadDirectToCloudinary(mockFile, 'gram2city/chat')).rejects.toThrow(
      'Failed to acquire secure upload signature from server',
    );
  });

  it('throws an error if Cloudinary upload response is not ok', async () => {
    vi.mocked(axiosSecure.post).mockResolvedValueOnce({
      data: {
        success: true,
        data: {
          signature: 'mock_sha1_signature',
          timestamp: 1729170000,
          apiKey: 'mock_api_key_123',
          cloudName: 'gram2city_cdn',
          folder: 'gram2city/chat',
        },
      },
    });

    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      text: vi.fn().mockResolvedValueOnce('Cloudinary 400 Bad Request: Invalid signature'),
    });
    vi.stubGlobal('fetch', mockFetch);

    await expect(uploadDirectToCloudinary(mockFile, 'gram2city/chat')).rejects.toThrow(
      'Direct media upload to Cloudinary CDN failed',
    );
  });
});
