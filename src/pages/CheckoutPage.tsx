import { Link, useParams, useRouter } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { getFriendlyErrorMessage } from '../api/client';
import { createPurchase } from '../api/purchases';
import { cancelReservation } from '../api/reservations';
import { useAuth } from '../auth/useAuth';

const RESERVATION_TTL_STORAGE_PREFIX = 'svi.reservation.ttl.';
const DEFAULT_RESERVATION_TTL_SECONDS = 5 * 60;

interface StoredReservationTtl {
  expiresAt: string;
  remainingSeconds: number;
  createdAt: string;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function formatRemainingTime(seconds: number) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function readReservationTtl(reservationId: string): StoredReservationTtl | null {
  const rawValue = window.sessionStorage.getItem(`${RESERVATION_TTL_STORAGE_PREFIX}${reservationId}`);

  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as StoredReservationTtl;
  } catch {
    return null;
  }
}

function getRemainingSeconds(expiresAt: string | null, now: number) {
  if (!expiresAt) {
    return null;
  }

  const expiresAtTime = new Date(expiresAt).getTime();

  if (Number.isNaN(expiresAtTime)) {
    return null;
  }

  return Math.max(Math.ceil((expiresAtTime - now) / 1000), 0);
}

export function CheckoutPage() {
  const { eventId, reservationId } = useParams({
    from: '/events/$eventId/checkout/$reservationId',
  });
  const auth = useAuth();
  const router = useRouter();
  const [holderName, setHolderName] = useState(auth.user?.name ?? '');
  const [cardNumber, setCardNumber] = useState('');
  const [approved, setApproved] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const hasExpiredRedirectRef = useRef(false);
  const [now, setNow] = useState(() => Date.now());
  const [reservationTtl] = useState(() => readReservationTtl(reservationId));
  const [fallbackExpiresAt] = useState(
    () => Date.now() + DEFAULT_RESERVATION_TTL_SECONDS * 1000,
  );
  const remainingSeconds = useMemo(() => {
    const expiresAt = reservationTtl?.expiresAt ?? new Date(fallbackExpiresAt).toISOString();
    const remainingFromExpiration = getRemainingSeconds(expiresAt, now);

    if (remainingFromExpiration !== null) {
      return remainingFromExpiration;
    }

    return reservationTtl?.remainingSeconds ?? DEFAULT_RESERVATION_TTL_SECONDS;
  }, [fallbackExpiresAt, now, reservationTtl]);
  const isExpired = remainingSeconds <= 0;

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!isExpired || success || hasExpiredRedirectRef.current) {
      return;
    }

    hasExpiredRedirectRef.current = true;
    window.sessionStorage.removeItem(`${RESERVATION_TTL_STORAGE_PREFIX}${reservationId}`);
    void router.navigate({
      params: { eventId },
      to: '/events/$eventId/tickets',
    });
  }, [eventId, isExpired, reservationId, router, success]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (isExpired) {
      setError('Sua reserva temporaria expirou. Volte ao mapa e escolha o assento novamente.');
      return;
    }

    setIsSubmitting(true);

    try {
      const purchase = await createPurchase({
        reservationId,
        holderName,
        payment: {
          cardNumber,
          approved,
        },
      });

      setSuccess(
        `Compra confirmada para o assento ${purchase.ticket.seat} em ${formatDate(
          purchase.purchasedAt,
        )}.`,
      );
      window.sessionStorage.removeItem(`${RESERVATION_TTL_STORAGE_PREFIX}${reservationId}`);
      window.setTimeout(() => {
        void router.navigate({ to: '/dashboard' });
      }, 900);
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    setError('');
    setSuccess('');
    setIsCanceling(true);

    try {
      await cancelReservation(reservationId);
      window.sessionStorage.removeItem(`${RESERVATION_TTL_STORAGE_PREFIX}${reservationId}`);
      await router.navigate({
        params: { eventId },
        to: '/events/$eventId/tickets',
      });
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setIsCanceling(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          className="text-sm font-medium text-emerald-700 hover:text-emerald-600"
          params={{ eventId }}
          to="/events/$eventId/tickets"
        >
          Voltar para ingressos
        </Link>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70 sm:p-8">
          <header className="border-b border-slate-200 pb-6">
            <p className="text-sm font-semibold tracking-wide text-emerald-700">Checkout</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal">
              Finalizar reserva
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Informe o titular e os dados de pagamento para confirmar o ingresso.
            </p>
          </header>

          <div
            className={`mt-6 rounded-lg border px-4 py-3 ${
              isExpired
                ? 'border-rose-200 bg-rose-50 text-rose-700'
                : 'border-amber-200 bg-amber-50 text-amber-800'
            }`}
          >
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-semibold">Reserva temporaria</p>
              <p className="font-mono text-2xl font-semibold tracking-normal">
                {formatRemainingTime(remainingSeconds)}
              </p>
            </div>
            <p className="mt-1 text-sm">
              {isExpired
                ? 'O prazo de 5 minutos terminou.'
                : 'Voce tem 5 minutos para concluir o pagamento antes do assento voltar ao mapa.'}
            </p>
          </div>

          {error ? (
            <div className="mt-6 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Nome do titular</span>
              <input
                autoComplete="name"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                onChange={(event) => setHolderName(event.target.value)}
                required
                type="text"
                value={holderName}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Numero do cartao</span>
              <input
                autoComplete="cc-number"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                inputMode="numeric"
                minLength={4}
                onChange={(event) => setCardNumber(event.target.value)}
                placeholder="4111111111111111"
                required
                type="text"
                value={cardNumber}
              />
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <input
                checked={approved}
                className="mt-1 h-4 w-4 accent-emerald-600"
                onChange={(event) => setApproved(event.target.checked)}
                type="checkbox"
              />
              <span>Simular pagamento aprovado</span>
            </label>

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-between">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                disabled={isCanceling || isSubmitting}
                onClick={handleCancel}
                type="button"
              >
                {isCanceling ? 'Cancelando...' : 'Cancelar reserva'}
              </button>

              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                disabled={isSubmitting || isCanceling || isExpired}
                type="submit"
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar compra'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
