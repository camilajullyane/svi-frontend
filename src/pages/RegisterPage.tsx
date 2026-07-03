import { AuthLayout } from '../components/auth/AuthLayout';
import { RegisterForm } from '../components/auth/RegisterForm';

export function RegisterPage() {
  return (
    <AuthLayout
      eyebrow="Crie sua conta"
      subtitle="Cadastre-se para reservar ingressos e acessar sua conta em poucos segundos."
      title="Crie sua conta para reservar ingressos"
    >
      <RegisterForm />
    </AuthLayout>
  );
}
