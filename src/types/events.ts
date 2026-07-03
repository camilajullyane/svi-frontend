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

export interface TicketOption {
  id: string;
  name: string;
  price: number | null;
  availableQuantity: number | null;
  status: string | null;
  expiresAt: string | null;
  remainingSeconds: number | null;
}
