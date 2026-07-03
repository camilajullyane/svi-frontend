import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getFriendlyErrorMessage } from '../api/client';
import { deleteAdminEvent, getEvents } from '../api/events';
import type { EventSummary } from '../types/events';

function formatDate(value: string | null) {
  if (!value) {
    return 'Data a confirmar';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

export function AdminEventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadEvents() {
    const data = await getEvents();
    setEvents(data);
  }

  useEffect(() => {
    let isActive = true;

    async function fetchEvents() {
      try {
        const data = await getEvents();

        if (isActive) {
          setEvents(data);
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

    void fetchEvents();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleDelete(event: EventSummary) {
    const confirmed = window.confirm(`Remover o evento "${event.title}"?`);

    if (!confirmed) {
      return;
    }

    setError('');
    setDeletingId(event.id);

    try {
      await deleteAdminEvent(event.id);
      await loadEvents();
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link className="text-sm font-medium text-emerald-700 hover:text-emerald-600" to="/dashboard">
              Voltar para minha conta
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">Gerenciar eventos</h1>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
            to="/admin/events/new"
          >
            Novo evento
          </Link>
        </header>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                className="h-24 animate-pulse rounded-lg border border-slate-200 bg-white"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && events.length === 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Nenhum evento cadastrado.
          </div>
        ) : null}

        {!isLoading && events.length > 0 ? (
          <section className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
            <div className="divide-y divide-slate-200">
              {events.map((event) => (
                <article className="grid gap-4 p-5 md:grid-cols-[1fr_auto]" key={event.id}>
                  <div>
                    <h2 className="text-lg font-semibold tracking-normal text-slate-950">
                      {event.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {formatDate(event.startsAt)} - {event.venue}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.remainingSeats ?? 0} de {event.totalSeats ?? 0} assentos disponiveis
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row md:items-center">
                    <Link
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      params={{ eventId: event.id }}
                      to="/admin/events/$eventId/edit"
                    >
                      Editar
                    </Link>
                    <button
                      className="inline-flex min-h-10 items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={deletingId === event.id}
                      onClick={() => void handleDelete(event)}
                      type="button"
                    >
                      {deletingId === event.id ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
