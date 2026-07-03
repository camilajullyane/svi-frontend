import { createRouter } from '@tanstack/react-router';
import type { AuthContextValue } from './auth/AuthContext';
import { rootRoute } from './routes/__root';
import { dashboardRoute } from './routes/dashboard';
import { eventDetailsRoute } from './routes/event-details';
import { eventTicketsRoute } from './routes/event-tickets';
import { indexRoute } from './routes';
import { loginRoute } from './routes/login';
import { registerRoute } from './routes/register';

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  dashboardRoute,
  eventDetailsRoute,
  eventTicketsRoute,
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: undefined as unknown as AuthContextValue,
  },
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
