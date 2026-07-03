import { createRootRouteWithContext } from '@tanstack/react-router';
import type { AuthContextValue } from '../auth/AuthContext';
import { RootPage } from '../pages/RootPage';

export interface RouterContext {
  auth: AuthContextValue;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: RootPage,
});
