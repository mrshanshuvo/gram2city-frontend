import { axiosSecure } from '../../api/axios';
import { uploadDirectToCloudinary } from '@/lib/cloudinary';

export const fetchConversations = async () => {
  const res = await axiosSecure.get('/messages/conversations');
  return res.data.data;
};

export const fetchMessages = async (conversationId: string) => {
  const res = await axiosSecure.get(`/messages/${conversationId}`);
  return res.data.data;
};

export const uploadFile = async (file: File): Promise<string> => {
  try {
    return await uploadDirectToCloudinary(file, 'gram2city/chat');
  } catch (err) {
    console.warn('Direct Cloudinary upload failed; falling back to server relay:', err);
    const formData = new FormData();
    formData.append('image', file);
    const res = await axiosSecure.post('/messages/upload-image', formData);
    return res.data.url;
  }
};
