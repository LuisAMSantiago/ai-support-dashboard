import { isAxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  meta?: { message?: string };
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError<ApiErrorBody>(error)) return fallback;
  const body = error.response?.data;
  const message = body?.meta?.message || body?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}
