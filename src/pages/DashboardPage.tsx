import { Link, useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { getFriendlyErrorMessage } from '../api/client';
import { getMyPurchases } from '../api/purchases';
import { useAuth } from '../auth/useAuth';
import type { Purchase } from '../types/purchases';

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

export function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function loadPurchases() {
      try {
        const data = await getMyPurchases();

        if (isActive) {
          setPurchases(data);
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

    void loadPurchases();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleLogout() {
    auth.logout();
    await router.navigate({ to: '/login' });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold tracking-wide text-emerald-700">SVI Tickets</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-normal">Minha conta</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {auth.user?.role === 'admin' ? (
              <Link
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
                to="/admin/events"
              >
                Gerenciar eventos
              </Link>
            ) : null}
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
              onClick={handleLogout}
              type="button"
            >
              Sair
            </button>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
            <p className="text-sm font-medium text-slate-500">Bem-vindo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              {auth.user?.name}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Sua sessao esta ativa. Voce pode reservar ingressos, concluir compras e acompanhar
              seu historico nesta area.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
            <h2 className="text-base font-semibold tracking-normal text-slate-950">
              Dados da conta
            </h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Nome</dt>
                <dd className="mt-1 font-medium text-slate-900">{auth.user?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="mt-1 break-words font-medium text-slate-900">
                  {auth.user?.email}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Role</dt>
                <dd className="mt-1 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                  {auth.user?.role}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Historico</p>
              <h2 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
                Minhas compras
              </h2>
            </div>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
              to="/"
            >
              Ver eventos
            </Link>
          </div>

          {isLoading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  className="h-20 animate-pulse rounded-lg border border-slate-200 bg-slate-50"
                  key={index}
                />
              ))}
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && purchases.length === 0 ? (
            <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Nenhuma compra encontrada.
            </div>
          ) : null}

          {!isLoading && !error && purchases.length > 0 ? (
            <div className="mt-5 divide-y divide-slate-200">
              {purchases.map((purchase) => (
                <article
                  className="grid gap-4 py-5 first:pt-0 last:pb-0 md:grid-cols-[1fr_auto]"
                  key={purchase.id}
                >
                  <div>
                    <h3 className="font-semibold tracking-normal text-slate-950">
                      {purchase.ticket.event.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      Assento {purchase.ticket.seat} para {purchase.holderName}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {purchase.ticket.event.location}
                    </p>
                  </div>
                  <div className="text-sm text-slate-600 md:text-right">
                    <p className="font-medium text-emerald-700">{purchase.status}</p>
                    <p className="mt-1">{formatDate(purchase.purchasedAt)}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
