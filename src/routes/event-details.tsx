import { createRoute } from '@tanstack/react-router';
import { EventDetailsPage } from '../pages/EventDetailsPage';
import { rootRoute } from './__root';

export const eventDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/events/$eventId',
  component: EventDetailsPage,
});
