import { createRoute } from '@tanstack/react-router';
import { AdminEventCreatePage } from '../pages/AdminEventFormPage';
import { rootRoute } from './__root';
import { requireAdmin } from './admin-events';

export const adminEventNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/events/new',
  beforeLoad: ({ context }) => requireAdmin(context),
  component: AdminEventCreatePage,
});
