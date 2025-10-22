import { ApiError } from '@/types';

export function createApiError(
  code: string, 
  message: string, 
  requestId?: string
): ApiError {
  return {
    code,
    message,
    requestId,
  };
}

export function createErrorResponse(
  code: string, 
  message: string, 
  requestId?: string
) {
  return {
    success: false,
    error: createApiError(code, message, requestId),
  };
}
