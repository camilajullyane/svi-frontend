import { apiRequest } from './client';

export interface ReservationResponse {
  id: string;
  userId: number;
  ticketId: number;
  expiresAt: string;
  remainingSeconds: number;
}

export function createReservation(ticketId: string) {
  return apiRequest<ReservationResponse>('/reservations', {
    method: 'POST',
    body: JSON.stringify({ ticketId: Number(ticketId) }),
  });
}
