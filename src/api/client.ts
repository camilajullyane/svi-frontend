import { getStoredToken } from '../auth/auth-storage';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function getResponseMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const body = payload as { message?: unknown; error?: unknown };

    if (typeof body.message === 'string') {
      return body.message;
    }

    if (Array.isArray(body.message) && body.message.every((item) => typeof item === 'string')) {
      return body.message.join(' ');
    }

    if (typeof body.error === 'string') {
      return body.error;
    }
  }

  return fallback;
}

async function parseResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getStoredToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });
  const payload = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getResponseMessage(payload, 'Nao foi possivel concluir a solicitacao. Tente novamente.'),
      response.status,
      payload,
    );
  }

  return payload as T;
}

export function getFriendlyErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof TypeError) {
    return 'Nao foi possivel conectar ao servidor. Verifique se a API esta rodando.';
  }

  return 'Algo saiu do esperado. Tente novamente em instantes.';
}
