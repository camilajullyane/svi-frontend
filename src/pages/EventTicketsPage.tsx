import { Link, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getFriendlyErrorMessage } from "../api/client";
import { getEvent, getEventTickets } from "../api/events";
import { createReservation } from "../api/reservations";
import type { EventDetails, TicketOption } from "../types/events";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Preço a confirmar";
  }

  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

export function EventTicketsPage() {
  const { eventId } = useParams({ from: "/events/$eventId/tickets" });
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reservingTicketId, setReservingTicketId] = useState<string | null>(
    null,
  );

  async function refreshTickets() {
    const [eventData, ticketData] = await Promise.all([
      getEvent(eventId),
      getEventTickets(eventId),
    ]);

    setEvent(eventData);
    setTickets(ticketData);
  }

  useEffect(() => {
    let isActive = true;

    async function loadTickets() {
      try {
        const [eventData, ticketData] = await Promise.all([
          getEvent(eventId),
          getEventTickets(eventId),
        ]);

        if (isActive) {
          setEvent(eventData);
          setTickets(ticketData);
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

    void loadTickets();

    return () => {
      isActive = false;
    };
  }, [eventId]);

  async function handleReserve(ticket: TicketOption) {
    setError("");
    setReservingTicketId(ticket.id);

    try {
      const reservation = await createReservation(ticket.id);
      await router.navigate({
        params: { eventId, reservationId: reservation.id },
        to: "/events/$eventId/checkout/$reservationId",
      });
    } catch (requestError) {
      await refreshTickets();
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setReservingTicketId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-4xl">
        <Link
          className="text-sm font-medium text-emerald-700 hover:text-emerald-600"
          params={{ eventId }}
          to="/events/$eventId"
        >
          Voltar para o evento
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold tracking-wide text-emerald-700">
            Ingressos
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            {event?.title ?? "Ingressos do evento"}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Escolha um assento disponivel. A reserva e temporaria e sera
            confirmada somente apos o pagamento.
          </p>
        </header>

        {isLoading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
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

        {!isLoading && !error && tickets.length === 0 ? (
          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            Nenhum ingresso disponivel para este evento no momento.
          </div>
        ) : null}

        {!isLoading && !error && tickets.length > 0 ? (
          <section className="mt-8 space-y-4">
            {tickets.map((ticket) => (
              <article
                className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                key={ticket.id}
              >
                <div>
                  <h2 className="font-semibold tracking-normal text-slate-950">
                    {ticket.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {ticket.availableQuantity === null
                      ? "Disponibilidade a confirmar"
                      : `${ticket.availableQuantity} disponiveis`}
                  </p>
                  {ticket.status ? (
                    <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                      {ticket.status}
                    </p>
                  ) : null}
                  {ticket.remainingSeconds ? (
                    <p className="mt-1 text-xs text-amber-700">
                      Reserva expira em {ticket.remainingSeconds}s
                    </p>
                  ) : null}
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-lg font-semibold text-emerald-700">
                    {formatCurrency(ticket.price)}
                  </p>
                  <button
                    className="mt-3 inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                    disabled={
                      ticket.status !== "available" ||
                      reservingTicketId === ticket.id
                    }
                    onClick={() => void handleReserve(ticket)}
                    type="button"
                  >
                    {reservingTicketId === ticket.id
                      ? "Reservando..."
                      : "Reservar"}
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>
    </main>
  );
}
