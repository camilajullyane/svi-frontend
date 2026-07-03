import { AuthLayout } from '../components/auth/AuthLayout';
import { LoginForm } from '../components/auth/LoginForm';

export function LoginPage() {
  return (
    <AuthLayout
      eyebrow="Acesse sua conta"
      subtitle="Entre para encontrar seus eventos, acompanhar reservas e finalizar compras com seguranca."
      title="Entre para encontrar seus eventos"
    >
      <LoginForm />
    </AuthLayout>
  );
}
