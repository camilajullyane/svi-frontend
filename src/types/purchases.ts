import type { ApiEvent } from './events';

export interface PaymentPayload {
  cardNumber: string;
  approved?: boolean;
  [key: string]: unknown;
}

export interface CreatePurchasePayload {
  reservationId: string;
  holderName: string;
  payment: PaymentPayload;
}

export interface Purchase {
  id: number;
  holderName: string;
  status: string;
  purchasedAt: string;
  ticket: {
    id: number;
    seat: string;
    event: ApiEvent;
  };
}
