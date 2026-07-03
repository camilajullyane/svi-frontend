import type { ReactNode } from 'react';

interface AuthLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthLayout({ eyebrow, title, subtitle, children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden overflow-hidden bg-emerald-50 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(16,185,129,0.18),transparent_30%),radial-gradient(circle_at_78%_14%,rgba(20,184,166,0.14),transparent_28%),linear-gradient(135deg,rgba(240,253,250,0.98),rgba(248,250,252,1))]" />
          <div className="absolute inset-x-12 top-12 flex items-center justify-between text-sm text-slate-600">
            <span className="font-semibold tracking-wide text-emerald-700">SVI Tickets</span>
            <span>Eventos ao vivo</span>
          </div>
          <div className="relative flex h-full items-center px-12">
            <div className="w-full max-w-lg">
              <div className="mb-8 inline-flex rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm text-emerald-800 shadow-sm">
                Reservas seguras para experiencias presenciais
              </div>
              <div className="space-y-4">
                <div className="h-24 rounded-lg border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-900/5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Festival Norte</span>
                    <span>Hoje</span>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-slate-100">
                    <div className="h-3 w-2/3 rounded-full bg-emerald-500" />
                  </div>
                </div>
                <div className="ml-10 h-24 rounded-lg border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-900/5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Teatro Central</span>
                    <span>Setor A</span>
                  </div>
                  <div className="mt-4 grid grid-cols-8 gap-2">
                    {Array.from({ length: 24 }).map((_, index) => (
                      <span
                        className={`h-2 rounded-full ${index % 5 === 0 ? 'bg-emerald-500' : 'bg-slate-200'}`}
                        key={index}
                      />
                    ))}
                  </div>
                </div>
                <div className="mr-12 h-24 rounded-lg border border-emerald-100 bg-white p-5 shadow-xl shadow-emerald-900/5">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Arena Sul</span>
                    <span>Confirmado</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <span className="h-8 flex-1 rounded-md bg-slate-100" />
                    <span className="h-8 flex-1 rounded-md bg-emerald-200" />
                    <span className="h-8 flex-1 rounded-md bg-slate-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <p className="text-sm font-semibold tracking-wide text-emerald-700">SVI Tickets</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 sm:p-8">
              <div className="mb-8">
                <p className="text-sm font-medium text-emerald-700">{eyebrow}</p>
                <h1 className="mt-3 text-3xl font-semibold tracking-normal text-slate-950">
                  {title}
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
