import { HttpErrorResponse } from '@angular/common/http';

interface ApiFailure {
  code: string;
  error: string;
}

export function apiMessage(response: HttpErrorResponse, fallback: string): string {
  const body = response.error as Partial<ApiFailure> | null;

  return body?.error ?? fallback;
}
