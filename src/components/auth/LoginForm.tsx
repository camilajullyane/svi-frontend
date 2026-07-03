import { Link, useRouter } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { getFriendlyErrorMessage } from '../../api/client';
import { consumeAuthRedirect } from '../../auth/auth-redirect';
import { useAuth } from '../../auth/useAuth';

export function LoginForm() {
  const auth = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await auth.login({ email, password });
      const redirectTo = consumeAuthRedirect();

      if (redirectTo) {
        window.location.assign(redirectTo);
        return;
      }

      await router.navigate({ to: '/dashboard' });
    } catch (requestError) {
      setError(getFriendlyErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Email</span>
        <input
          autoComplete="email"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@email.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-slate-700">Senha</span>
        <input
          autoComplete="current-password"
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Digite sua senha"
          required
          type="password"
          value={password}
        />
      </label>

      <button
        className="flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? 'Entrando...' : 'Acessar minha conta'}
      </button>

      <p className="text-center text-sm text-slate-500">
        Ainda nao tem conta?{' '}
        <Link className="font-medium text-emerald-700 hover:text-emerald-600" to="/register">
          Criar conta
        </Link>
      </p>
    </form>
  );
}
