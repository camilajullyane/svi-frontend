import { Link, useParams, useRouter } from '@tanstack/react-router';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { getFriendlyErrorMessage } from '../api/client';
import {
  createAdminEvent,
  getEvent,
  getEventTickets,
  updateAdminEvent,
} from '../api/events';
import type { EventPayload, SeatInput, TicketOption } from '../types/events';

function toDatetimeLocal(value: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function toIsoDate(value: string) {
  return new Date(value).toISOString();
}

function parseSeats(value: string): SeatInput[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [seat = '', price = '', type = 'standard'] = line.split(',').map((item) => item.trim());

      return {
        seat,
        price,
        type,
      };
    })
    .filter((seat) => seat.seat && seat.price && seat.type);
}

function serializeSeats(tickets: TicketOption[]) {
  return tickets
    .map((ticket) => {
      const price = ticket.price === null ? '0.00' : ticket.price.toFixed(2);

      return `${ticket.name}, ${price}, ${ticket.type ?? 'standard'}`;
    })
    .join('\n');
}

function EventForm({ eventId }: { eventId?: string }) {
  const router = useRouter();
  const isEditing = Boolean(eventId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [seatsText, setSeatsText] = useState('A1, 120.00, standard\nA2, 180.00, vip');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => (isEditing ? 'Editar evento' : 'Novo evento'), [isEditing]);

  useEffect(() => {
    if (!eventId) {
      return undefined;
    }

    const currentEventId = eventId;
    let isActive = true;

    async function loadEvent() {
      try {
        const [event, tickets] = await Promise.all([
          getEvent(currentEventId),
          getEventTickets(currentEventId),
        ]);

        if (isActive) {
          setName(event.title);
          setDescription(event.description);
          setDate(toDatetimeLocal(event.startsAt));
          setLocation(event.venue);
          setSeatsText(serializeSeats(tickets));
        }
      } catch (requestError) {
        if (isActive) {
          setError(getFriendlyErrorMessage(requestError));
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    void loadEvent();

    return () => {
      isActive = false;
    };
  }, [eventId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const seats = parseSeats(seatsText);

    if (seats.length === 0) {
      setError('Informe pelo menos um assento no formato A1, 120.00, standard.');
      setIsSubmitting(false);
      return;
    }

    const trimmedDescription = description.trim();
    const payload: EventPayload = {
      name,
      date: toIsoDate(date),
      location,
      seats,
      ...(trimmedDescription ? { description: trimmedDescription } : {}),
    };

    try {
      if (eventId) {
        await updateAdminEvent(eventId, payload);
      } else {
        await createAdminEvent(payload);
      }

      await router.navigate({ to: '/admin/events' });
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="text-sm font-medium text-emerald-700 hover:text-emerald-600"
          to="/admin/events"
        >
          Voltar para eventos
        </Link>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold tracking-wide text-emerald-700">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">{title}</h1>
          </header>

          {isLoading ? (
            <div className="mt-6 h-80 animate-pulse rounded-lg border border-slate-200 bg-slate-50" />
          ) : null}

          {!isLoading && error ? (
            <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!isLoading ? (
            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Nome</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setName(event.target.value)}
                  required
                  type="text"
                  value={name}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Descricao</span>
                <textarea
                  className="mt-2 min-h-28 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Resumo opcional para aparecer na listagem e no detalhe do evento"
                  value={description}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Data e horario</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setDate(event.target.value)}
                  required
                  type="datetime-local"
                  value={date}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Local</span>
                <input
                  className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setLocation(event.target.value)}
                  required
                  type="text"
                  value={location}
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Assentos</span>
                <textarea
                  className="mt-2 min-h-44 w-full resize-y rounded-md border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  onChange={(event) => setSeatsText(event.target.value)}
                  required
                  value={seatsText}
                />
                <span className="mt-2 block text-xs text-slate-500">
                  Use uma linha por assento: A1, 120.00, standard
                </span>
              </label>

              <div className="flex justify-end border-t border-slate-200 pt-5">
                <button
                  className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  disabled={isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? 'Salvando...' : 'Salvar evento'}
                </button>
              </div>
            </form>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export function AdminEventCreatePage() {
  return <EventForm />;
}

export function AdminEventEditPage() {
  const { eventId } = useParams({ from: '/admin/events/$eventId/edit' });

  return <EventForm eventId={eventId} />;
}
