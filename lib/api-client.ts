import axios from 'axios';
import { ApiResponse, ModelType } from '@/types';
import { createErrorResponse } from './error-handler';

const localApi = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const dashScopeApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.DASHSCOPE_API_KEY}`,
  },
});

export const createTaskLocal = async (imageUrl: string, videoUrl: string, model: ModelType): Promise<ApiResponse> => {
  try {
    const response = await localApi.post('/create-task', {
      imageUrl,
      videoUrl,
      model,
    });
    
    return response.data;
  } catch (error: any) {
    return error.response?.data || createErrorResponse('NetworkError', '网络请求失败');
  }
};

export const queryTaskLocal = async (taskId: string): Promise<ApiResponse> => {
  try {
    const response = await localApi.get(`/query-task?taskId=${taskId}`);
    return response.data;
  } catch (error: any) {
    return error.response?.data || createErrorResponse('NetworkError', '网络请求失败');
  }
};

export const uploadFile = async (file: File): Promise<ApiResponse> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('/api/upload/simple', {
      method: 'POST',
      body: formData,
    });
    
    return await response.json();
  } catch (error) {
    return createErrorResponse('UploadError', '文件上传失败');
  }
};

export const createTask = async (imageUrl: string, videoUrl: string, model: ModelType): Promise<ApiResponse> => {
  try {
    const response = await dashScopeApi.post('/api/v1/services/aigc/image2video/video-synthesis/', {
      model: 'wan2.2-animate-mix',
      input: {
        image_url: imageUrl,
        video_url: videoUrl,
      },
      parameters: {
        model,
      },
    }, {
      headers: {
        'X-DashScope-Async': 'enable',
      },
    });
    
    return {
      success: true,
      data: response.data.output,
      requestId: response.data.request_id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.response?.data?.code || 'UnknownError',
        message: error.response?.data?.message || 'Request failed',
        requestId: error.response?.data?.request_id,
      },
    };
  }
};

export const queryTask = async (taskId: string): Promise<ApiResponse> => {
  try {
    const response = await dashScopeApi.get(`/api/v1/tasks/${taskId}`);
    return {
      success: true,
      data: response.data.output,
      requestId: response.data.request_id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: {
        code: error.response?.data?.code || 'UnknownError',
        message: error.response?.data?.message || 'Request failed',
        requestId: error.response?.data?.request_id,
      },
    };
  }
};
