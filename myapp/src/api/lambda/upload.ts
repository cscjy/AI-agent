import axios from 'axios';

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
    'http://localhost:3000/api/upload-image',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      withCredentials: true,
    },
  );

  return data;
};
