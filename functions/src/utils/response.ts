/**
 * Response utility for consistent API formatting
 */

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export const successResponse = <T>(data: T, message?: string): ApiSuccessResponse<T> => ({
  success: true,
  data,
  message,
});

export const errorResponse = (error: string, code?: string): ApiErrorResponse => ({
  success: false,
  error,
  code,
});

export const isSuccessResponse = (response: any): response is ApiSuccessResponse => {
  return response && response.success === true;
};