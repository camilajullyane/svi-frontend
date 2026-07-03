import { createRoute, redirect } from '@tanstack/react-router';
import { DashboardPage } from '../pages/DashboardPage';
import { rootRoute } from './__root';

export const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: DashboardPage,
});
