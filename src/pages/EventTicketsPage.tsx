import { Link, useParams, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getFriendlyErrorMessage } from "../api/client";
import { getEvent, getEventTickets } from "../api/events";
import { createReservation } from "../api/reservations";
import type { EventDetails, TicketOption } from "../types/events";

const RESERVATION_TTL_STORAGE_PREFIX = "svi.reservation.ttl.";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Preço a confirmar";
  }

  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    style: "currency",
  }).format(value);
}

function formatRemainingTime(seconds: number | null) {
  if (seconds === null) {
    return null;
  }

  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getRemainingSeconds(ticket: TicketOption, now: number) {
  if (ticket.expiresAt) {
    const expiresAt = new Date(ticket.expiresAt).getTime();

    if (!Number.isNaN(expiresAt)) {
      return Math.max(Math.ceil((expiresAt - now) / 1000), 0);
    }
  }

  return ticket.remainingSeconds;
}

function persistReservationTtl(reservation: {
  id: string;
  expiresAt: string;
  remainingSeconds: number;
}) {
  window.sessionStorage.setItem(
    `${RESERVATION_TTL_STORAGE_PREFIX}${reservation.id}`,
    JSON.stringify({
      expiresAt: reservation.expiresAt,
      remainingSeconds: reservation.remainingSeconds,
      createdAt: new Date().toISOString(),
    }),
  );
}

function getSeatParts(label: string) {
  const match = /^([A-Za-z]+)[\s-_]*(\d+)?/.exec(label.trim());

  return {
    row: match?.[1]?.toUpperCase() ?? "GERAL",
    number: match?.[2] ? Number(match[2]) : Number.MAX_SAFE_INTEGER,
  };
}

function groupTicketsByRow(tickets: TicketOption[]) {
  const rows = new Map<string, TicketOption[]>();

  for (const ticket of tickets) {
    const { row } = getSeatParts(ticket.name);
    rows.set(row, [...(rows.get(row) ?? []), ticket]);
  }

  return Array.from(rows.entries())
    .map(([row, rowTickets]) => ({
      row,
      tickets: rowTickets.sort((left, right) => {
        const leftParts = getSeatParts(left.name);
        const rightParts = getSeatParts(right.name);

        return leftParts.number - rightParts.number || left.name.localeCompare(right.name);
      }),
    }))
    .sort((left, right) => left.row.localeCompare(right.row, "pt-BR", { numeric: true }));
}

function getSeatButtonClass(ticket: TicketOption, isSelected: boolean) {
  if (isSelected) {
    return "border-cyan-900 bg-cyan-600 text-white shadow-lg shadow-cyan-600/25 ring-2 ring-cyan-200";
  }

  if (ticket.status === "available") {
    return "border-emerald-600 bg-emerald-500 text-white shadow-sm hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-md";
  }

  if (ticket.status === "reserved") {
    return "cursor-not-allowed border-amber-300 bg-amber-100 text-amber-800";
  }

  return "cursor-not-allowed border-slate-300 bg-slate-200 text-slate-500";
}

export function EventTicketsPage() {
  const { eventId } = useParams({ from: "/events/$eventId/tickets" });
  const router = useRouter();
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [tickets, setTickets] = useState<TicketOption[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [reservingTicketId, setReservingTicketId] = useState<string | null>(
    null,
  );

  const seatRows = useMemo(() => groupTicketsByRow(tickets), [tickets]);
  const selectedTicket = useMemo(
    () => tickets.find((ticket) => ticket.id === selectedTicketId) ?? null,
    [selectedTicketId, tickets],
  );
  const availableCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === "available").length,
    [tickets],
  );
  const reservedCount = useMemo(
    () => tickets.filter((ticket) => ticket.status === "reserved").length,
    [tickets],
  );
  const soldCount = Math.max(tickets.length - availableCount - reservedCount, 0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

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
          setSelectedTicketId(
            ticketData.find((ticket) => ticket.status === "available")?.id ?? null,
          );
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
      persistReservationTtl(reservation);
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
      <div className="mx-auto w-full max-w-7xl">
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
          <section className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
              <div className="border-b border-slate-200 bg-slate-950 px-5 py-4 text-white">
                <div className="mx-auto h-10 w-full max-w-2xl rounded-b-[70%] border-b-4 border-cyan-300 bg-slate-800 text-center text-xs font-semibold uppercase tracking-[0.24em] leading-10 text-slate-200">
                  Palco
                </div>
              </div>

              <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                <div className="grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                  <div>
                    <span className="font-semibold text-slate-950">{availableCount}</span>{" "}
                    disponiveis
                  </div>
                  <div>
                    <span className="font-semibold text-slate-950">{reservedCount}</span>{" "}
                    reservados
                  </div>
                  <div>
                    <span className="font-semibold text-slate-950">{soldCount}</span> vendidos
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto px-4 py-6 sm:px-6">
                <div className="mx-auto min-w-max max-w-5xl rounded-lg border border-slate-200 bg-slate-50 p-5">
                  <div className="space-y-3">
                    {seatRows.map((seatRow) => (
                      <div className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-3" key={seatRow.row}>
                        <span className="text-center text-xs font-semibold text-slate-500">
                          {seatRow.row}
                        </span>
                        <div className="flex justify-center gap-2">
                          {seatRow.tickets.map((ticket) => {
                            const isSelected = ticket.id === selectedTicketId;
                            const isAvailable = ticket.status === "available";
                            const remainingTime = formatRemainingTime(
                              getRemainingSeconds(ticket, now),
                            );

                            return (
                              <button
                                aria-pressed={isSelected}
                                className={`h-9 w-9 rounded-t-lg rounded-b-sm border text-[11px] font-bold transition ${getSeatButtonClass(
                                  ticket,
                                  isSelected,
                                )}`}
                                disabled={!isAvailable}
                                key={ticket.id}
                                onClick={() => setSelectedTicketId(ticket.id)}
                                title={`${ticket.name} - ${
                                  ticket.status ?? "status desconhecido"
                                } - ${formatCurrency(ticket.price)}${
                                  ticket.status === "reserved" && remainingTime
                                    ? ` - expira em ${remainingTime}`
                                    : ""
                                }`}
                                type="button"
                              >
                                {ticket.status === "reserved" && remainingTime
                                  ? remainingTime
                                  : getSeatParts(ticket.name).number === Number.MAX_SAFE_INTEGER
                                    ? ticket.name.slice(0, 2)
                                    : getSeatParts(ticket.name).number}
                              </button>
                            );
                          })}
                        </div>
                        <span className="text-center text-xs font-semibold text-slate-500">
                          {seatRow.row}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 border-t border-slate-200 px-5 py-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-t-md rounded-b-sm bg-emerald-500" />
                  Disponivel
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-t-md rounded-b-sm bg-cyan-600" />
                  Selecionado
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-t-md rounded-b-sm bg-amber-100 ring-1 ring-amber-300" />
                  Reservado
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-t-md rounded-b-sm bg-slate-200 ring-1 ring-slate-300" />
                  Vendido
                </span>
              </div>
            </div>

            <aside className="h-fit rounded-lg border border-slate-200 bg-white p-5 shadow-lg shadow-slate-200/70 lg:sticky lg:top-6">
              <p className="text-sm font-semibold tracking-wide text-emerald-700">
                Assento selecionado
              </p>

              {selectedTicket ? (
                <div className="mt-5">
                  <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-4">
                    <h2 className="text-2xl font-semibold tracking-normal text-slate-950">
                      {selectedTicket.name}
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedTicket.type ?? "Ingresso"}
                    </p>
                    <p className="mt-4 text-2xl font-semibold text-emerald-700">
                      {formatCurrency(selectedTicket.price)}
                    </p>
                  </div>

                  {getRemainingSeconds(selectedTicket, now) ? (
                    <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      Reserva ativa expira em{" "}
                      {formatRemainingTime(getRemainingSeconds(selectedTicket, now))}.
                    </p>
                  ) : null}

                  <button
                    className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:border disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500"
                    disabled={
                      selectedTicket.status !== "available" ||
                      reservingTicketId === selectedTicket.id
                    }
                    onClick={() => void handleReserve(selectedTicket)}
                    type="button"
                  >
                    {reservingTicketId === selectedTicket.id
                      ? "Reservando..."
                      : "Reservar assento"}
                  </button>
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  Selecione um assento disponivel no mapa para continuar.
                </div>
              )}
            </aside>
          </section>
        ) : null}
      </div>
    </main>
  );
}
