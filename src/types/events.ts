export interface EventSummary {
  id: string;
  title: string;
  description: string;
  startsAt: string | null;
  venue: string;
  city: string;
  imageUrl: string | null;
  status: string | null;
  remainingSeats: number | null;
  totalSeats: number | null;
}

export interface EventDetails extends EventSummary {
  category: string | null;
  address: string | null;
}

export interface ApiEvent {
  id: number;
  name: string;
  date: string;
  location: string;
  description?: string;
}

export interface ApiEventListItem extends ApiEvent {
  remainingSeats: number;
  totalSeats: number;
}

export interface SeatInput {
  seat: string;
  price: string;
  type: string;
}

export interface EventPayload {
  name: string;
  date: string;
  location: string;
  description?: string;
  seats: SeatInput[];
}

export type EventUpdatePayload = Partial<EventPayload>;

export interface SeatMapResponse {
  event: ApiEvent;
  seats: ApiSeat[];
}

export interface ApiSeat {
  ticketId: number;
  seat: string;
  price: string;
  type: string;
  status: 'available' | 'reserved' | 'sold';
  expiresAt: string | null;
  remainingSeconds: number | null;
}

export interface TicketOption {
  id: string;
  name: string;
  price: number | null;
  type: string | null;
  availableQuantity: number | null;
  status: string | null;
  expiresAt: string | null;
  remainingSeconds: number | null;
}
