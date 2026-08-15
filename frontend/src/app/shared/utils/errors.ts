import { ApiError } from '../../core/interceptors/error.interceptor';

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const candidate = error as Partial<ApiError>;
    if (typeof candidate.message === 'string' && candidate.message) {
      return candidate.message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}
