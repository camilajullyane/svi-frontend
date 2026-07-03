import { Link, useParams } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getFriendlyErrorMessage } from '../api/client';
import { getEvent } from '../api/events';
import type { EventDetails } from '../types/events';

function formatFullDate(value: string | null) {
  if (!value) {
    return 'Data a confirmar';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(date);
}

export function EventDetailsPage() {
  const { eventId } = useParams({ from: '/events/$eventId' });
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadEvent() {
      try {
        const data = await getEvent(eventId);

        if (isActive) {
          setEvent(data);
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

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <Link className="text-sm font-medium text-emerald-700 hover:text-emerald-600" to="/">
          Voltar para eventos
        </Link>

        {isLoading ? (
          <div className="mt-8 h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
        ) : null}

        {!isLoading && error ? (
          <div className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && event ? (
          <article className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-200/80">
            <div className="flex aspect-[21/9] min-h-60 items-center justify-center bg-emerald-50">
              {event.imageUrl ? (
                <img alt="" className="h-full w-full object-cover" src={event.imageUrl} />
              ) : (
                <span className="text-sm font-medium text-emerald-700">SVI Tickets</span>
              )}
            </div>
            <div className="grid gap-8 p-6 md:grid-cols-[1fr_18rem] md:p-8">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  {event.category ?? 'Evento'}
                </p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-5 leading-7 text-slate-600">{event.description}</p>
              </div>

              <aside className="rounded-lg border border-emerald-100 bg-emerald-50/70 p-5">
                <dl className="space-y-4 text-sm">
                  <div>
                    <dt className="text-slate-500">Quando</dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {formatFullDate(event.startsAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Onde</dt>
                    <dd className="mt-1 font-medium text-slate-900">
                      {[event.venue, event.city].filter(Boolean).join(' - ')}
                    </dd>
                  </div>
                  {event.address ? (
                    <div>
                      <dt className="text-slate-500">Endereco</dt>
                      <dd className="mt-1 font-medium text-slate-900">{event.address}</dd>
                    </div>
                  ) : null}
                </dl>

                <Link
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                  params={{ eventId }}
                  to="/events/$eventId/tickets"
                >
                  Ver ingressos
                </Link>
              </aside>
            </div>
          </article>
        ) : null}
      </div>
    </main>
  );
}
