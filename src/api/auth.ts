import { apiRequest } from './client';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export function loginRequest(payload: LoginPayload) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerRequest(payload: RegisterPayload) {
  return apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
