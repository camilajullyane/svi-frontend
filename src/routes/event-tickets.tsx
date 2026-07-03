import { createRoute, redirect } from '@tanstack/react-router';
import { setAuthRedirect } from '../auth/auth-redirect';
import { EventTicketsPage } from '../pages/EventTicketsPage';
import { rootRoute } from './__root';

export const eventTicketsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId/tickets',
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      setAuthRedirect(location.href);
      throw redirect({ to: '/login' });
    }
  },
  component: EventTicketsPage,
});
