import { createRoute } from '@tanstack/react-router';
import { EventsPage } from '../pages/EventsPage';
import { rootRoute } from './__root';

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: EventsPage,
});
