import { useRouter } from '@tanstack/react-router';
import { useAuth } from '../auth/useAuth';

export function DashboardPage() {
  const auth = useAuth();
  const router = useRouter();

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
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
            onClick={handleLogout}
            type="button"
          >
            Sair
          </button>
        </header>

        <section className="grid gap-5 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/70">
            <p className="text-sm font-medium text-slate-500">Bem-vindo</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
              {auth.user?.name}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
              Sua sessao esta ativa. A partir daqui, as proximas etapas do produto podem conectar
              eventos, assentos, reservas e compras.
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
      </div>
    </main>
  );
}
