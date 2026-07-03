import { createRoute, redirect } from '@tanstack/react-router';
import { setAuthRedirect } from '../auth/auth-redirect';
import { CheckoutPage } from '../pages/CheckoutPage';
import { rootRoute } from './__root';

export const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId/checkout/$reservationId',
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      setAuthRedirect(location.href);
      throw redirect({ to: '/login' });
    }
  },
  component: CheckoutPage,
});
