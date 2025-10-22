export interface FileUpload {
  file: File;
  preview: string;
  url?: string;
}

export type ModelType = 'std' | 'pro';

export type TaskStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';

export interface Task {
  taskId: string;
  status: TaskStatus;
  videoUrl?: string;
  duration?: number;
  error?: string;
  createdAt: number;
}

export interface ApiError {
  code: string;
  message: string;
  requestId?: string; // 改为可选
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  requestId?: string;
}
