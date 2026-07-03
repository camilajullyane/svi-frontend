import { apiRequest } from './client';
import type { CreatePurchasePayload, Purchase } from '../types/purchases';

export function createPurchase(payload: CreatePurchasePayload) {
  return apiRequest<Purchase>('/purchases', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getMyPurchases() {
  return apiRequest<Purchase[]>('/me/purchases');
}
