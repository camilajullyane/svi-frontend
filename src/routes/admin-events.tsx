import { createRoute, redirect } from '@tanstack/react-router';
import { AdminEventsPage } from '../pages/AdminEventsPage';
import { rootRoute } from './__root';

export function requireAdmin(context: {
  auth: { isAuthenticated: boolean; user: { role: string } | null };
}) {
  if (!context.auth.isAuthenticated) {
    throw redirect({ to: '/login' });
  }

  if (context.auth.user?.role !== 'admin') {
    throw redirect({ to: '/dashboard' });
  }
}

export const adminEventsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/events',
  beforeLoad: ({ context }) => requireAdmin(context),
  component: AdminEventsPage,
});
