export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function ok<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

export function fail(
  code: string,
  message: string,
  requestId?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(requestId ? { requestId } : {}),
    },
  };
}