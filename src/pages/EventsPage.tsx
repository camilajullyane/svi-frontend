import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "../api/client";
import { getEvents } from "../api/events";
import type { EventSummary } from "../types/events";

function formatDate(value: string | null) {
  if (!value) {
    return "Data a confirmar";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function EventsPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadEvents() {
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

    void loadEvents();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-700">
              SVI Tickets
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">
              Eventos disponiveis
            </h1>
          </div>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50"
            to="/login"
          >
            Acessar conta
          </Link>
        </header>

        {isLoading ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-72 animate-pulse rounded-lg border border-slate-200 bg-white"
                key={index}
              />
            ))}
          </div>
        ) : null}

        {!isLoading && error ? (
          <div className="mt-10 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!isLoading && !error && events.length === 0 ? (
          <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Nenhum evento disponivel no momento.
          </div>
        ) : null}

        {!isLoading && !error && events.length > 0 ? (
          <section className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <article
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/70"
                key={event.id}
              >
                <div className="flex aspect-[16/9] items-center justify-center bg-emerald-50">
                  {event.imageUrl ? (
                    <img
                      alt=""
                      className="h-full w-full object-cover"
                      src={event.imageUrl}
                    />
                  ) : (
                    <span className="text-sm font-medium text-emerald-700">
                      SVI Tickets
                    </span>
                  )}
                </div>
                <div className="flex min-h-56 flex-col p-5">
                  <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
                    <span>{formatDate(event.startsAt)}</span>
                    {event.status ? <span>{event.status}</span> : null}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold tracking-normal text-slate-950">
                    {event.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
                    {event.description}
                  </p>
                  <p className="mt-4 text-sm text-slate-500">
                    {[event.venue, event.city].filter(Boolean).join(" - ")}
                  </p>
                  <Link
                    className="mt-auto inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    params={{ eventId: event.id }}
                    to="/events/$eventId"
                  >
                    Confira
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
