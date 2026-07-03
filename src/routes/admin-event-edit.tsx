import { createRoute } from '@tanstack/react-router';
import { AdminEventEditPage } from '../pages/AdminEventFormPage';
import { rootRoute } from './__root';
import { requireAdmin } from './admin-events';

export const adminEventEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/events/$eventId/edit',
  beforeLoad: ({ context }) => requireAdmin(context),
  component: AdminEventEditPage,
});
