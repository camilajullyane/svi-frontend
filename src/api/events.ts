import { apiRequest } from './client';
import type {
  ApiEvent,
  EventDetails,
  EventPayload,
  EventSummary,
  EventUpdatePayload,
  TicketOption,
} from '../types/events';

type RawRecord = Record<string, unknown>;

function readString(record: RawRecord, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }

    if (typeof value === 'number') {
      return String(value);
    }
  }

  return fallback;
}

function readNullableString(record: RawRecord, keys: string[]) {
  const value = readString(record, keys);
  return value || null;
}

function readNullableNumber(record: RawRecord, keys: string[]) {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }

  return null;
}

function getCollection(payload: unknown, keys: string[]) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const record = payload as RawRecord;

    for (const key of keys) {
      const value = record[key];

      if (Array.isArray(value)) {
        return value;
      }
    }
  }

  return [];
}

function getRecord(payload: unknown, keys: string[]) {
  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    const record = payload as RawRecord;

    for (const key of keys) {
      const value = record[key];

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as RawRecord;
      }
    }

    return record;
  }

  return {};
}

function normalizeEvent(payload: unknown): EventDetails {
  const record = getRecord(payload, ['event', 'data']);

  return {
    id: readString(record, ['id', 'eventId', 'uuid']),
    title: readString(record, ['title', 'name'], 'Evento sem titulo'),
    description: readString(
      record,
      ['description', 'summary'],
      'Ingressos e assentos sujeitos a disponibilidade.',
    ),
    startsAt: readNullableString(record, ['startsAt', 'startDate', 'date', 'datetime']),
    venue: readString(record, ['venue', 'place', 'location'], 'Local a confirmar'),
    city: readString(record, ['city'], ''),
    imageUrl: readNullableString(record, ['imageUrl', 'image', 'coverUrl', 'bannerUrl']),
    status: readNullableString(record, ['status']),
    category: readNullableString(record, ['category', 'type']),
    address: readNullableString(record, ['address']),
    remainingSeats: readNullableNumber(record, ['remainingSeats']),
    totalSeats: readNullableNumber(record, ['totalSeats']),
  };
}

function normalizeTicket(payload: unknown): TicketOption {
  const record = getRecord(payload, ['ticket']);

  return {
    id: readString(record, ['id', 'ticketId', 'uuid']),
    name: readString(record, ['name', 'title', 'sector', 'seat'], 'Ingresso'),
    price: readNullableNumber(record, ['price', 'amount', 'value']),
    type: readNullableString(record, ['type', 'category']),
    availableQuantity:
      readNullableNumber(record, ['availableQuantity', 'quantity', 'available', 'remaining']) ??
      (record.status === 'available' ? 1 : 0),
    status: readNullableString(record, ['status']),
    expiresAt: readNullableString(record, ['expiresAt']),
    remainingSeconds: readNullableNumber(record, ['remainingSeconds']),
  };
}

export async function getEvents() {
  const response = await apiRequest<unknown>('/events');
  return getCollection(response, ['events', 'data', 'items']).map(normalizeEvent);
}

export async function getEvent(eventId: string) {
  const events = await getEvents();
  const event = events.find((item) => item.id === eventId);

  if (!event) {
    const seatMap = await apiRequest<unknown>(`/events/${eventId}/seats`);
    return normalizeEvent(seatMap);
  }

  return event;
}

export async function getEventTickets(eventId: string) {
  const response = await apiRequest<unknown>(`/events/${eventId}/seats`);
  return getCollection(response, ['seats', 'tickets', 'data', 'items']).map(normalizeTicket);
}

export function toEventSummary(event: EventDetails): EventSummary {
  return event;
}

export function createAdminEvent(payload: EventPayload) {
  return apiRequest<ApiEvent>('/admin/events', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateAdminEvent(eventId: string, payload: EventUpdatePayload) {
  return apiRequest<ApiEvent>(`/admin/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteAdminEvent(eventId: string) {
  return apiRequest<{ ok: boolean }>(`/admin/events/${eventId}`, {
    method: 'DELETE',
  });
}
