import axios from 'axios';
import { API_BASE_URL } from '../config';

export type UploadResponse = {
  success: boolean;
  message: string;
  url?: string;
  filename?: string;
  size?: number;
};

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('image', file);

  const { data } = await axios.post<UploadResponse>(
    `${API_BASE_URL}/api/upload-image`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    },
  );

  return data;
};
