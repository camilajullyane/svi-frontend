import { apiRequest } from './client';

export interface ReservationResponse {
  id: string;
  userId: number;
  ticketId: number;
  eventId: number;
  seat: string;
  expiresAt: string;
  remainingSeconds: number;
}

export function createReservation(ticketId: string) {
  return apiRequest<ReservationResponse>('/reservations', {
    method: 'POST',
    body: JSON.stringify({ ticketId: Number(ticketId) }),
  });
}

export function cancelReservation(reservationId: string) {
  return apiRequest<{ ok: boolean }>(`/reservations/${reservationId}`, {
    method: 'DELETE',
  });
}
