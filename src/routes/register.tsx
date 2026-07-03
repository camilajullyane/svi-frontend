import { createRoute, redirect } from '@tanstack/react-router';
import { RegisterPage } from '../pages/RegisterPage';
import { rootRoute } from './__root';

export const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/dashboard' });
    }
  },
  component: RegisterPage,
});
