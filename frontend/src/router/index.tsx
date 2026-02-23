import React from 'react';
import {createRootRouteWithContext, createRoute, createRouter, redirect, Outlet} from '@tanstack/react-router';
import {z} from 'zod';
import AuthLayout from '../components/AuthLayout';
import Layout from '../components/Layout';
import NotFoundPage from '../pages/NotFoundPage';
import SceneRouteBridge from '../pages/SceneRouteBridge';

interface RouterAuthContext {
  isAuthenticated: boolean;
  isAdmin: boolean;
  userRoles: string[];
}

export interface RouterContext {
  auth: RouterAuthContext;
}

const loginSearchSchema = z.object({
  redirect: z.string().optional(),
});

const adminSearchSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  size: z.coerce.number().int().min(1).max(100).optional(),
  search: z.string().optional(),
  floor: z.coerce.number().int().min(1).optional(),
  minCapacity: z.coerce.number().int().min(1).optional(),
  sort: z.string().optional(),
});

const LoginPage = React.lazy(() => import('../pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../pages/RegisterPage'));
const ConfirmationPage = React.lazy(() => import('../pages/ConfirmationPage'));

const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => {
  const Wrapped = () => (
    <React.Suspense fallback={null}>
      <Component />
    </React.Suspense>
  );
  return Wrapped;
};

const rootRoute = createRootRouteWithContext<RouterContext>()({
  component: Outlet,
  notFoundComponent: NotFoundPage,
});

const authLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'auth-layout',
  component: AuthLayout,
  beforeLoad: ({context}) => {
    if (context.auth.isAuthenticated) {
      throw redirect({to: '/schedule'});
    }
  },
});

const loginRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/login',
  component: withSuspense(LoginPage),
  validateSearch: (search) => loginSearchSchema.parse(search),
});

const registerRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/register',
  component: withSuspense(RegisterPage),
});

const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-layout',
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({to: '/schedule', replace: true});
  },
});

const scheduleRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/schedule',
  component: SceneRouteBridge,
});

const scheduleRoomRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/schedule/room/$roomId',
  component: SceneRouteBridge,
  beforeLoad: ({params}) => {
    if (!params.roomId?.trim()) {
      throw redirect({to: '/schedule', replace: true});
    }
  },
});

const requireAuthenticated = ({
  context,
  location,
}: {
  context: RouterContext;
  location: {pathname: string; searchStr: string};
}) => {
  if (!context.auth.isAuthenticated) {
    const redirectTo = `${location.pathname}${location.searchStr}`;
    throw redirect({
      to: '/login',
      search: {redirect: redirectTo},
      replace: true,
    });
  }
};

const myBookingsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/my-bookings',
  component: SceneRouteBridge,
  beforeLoad: requireAuthenticated,
});

const bookingConfirmedRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/booking/confirmed',
  component: withSuspense(ConfirmationPage),
  beforeLoad: requireAuthenticated,
});

const adminRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/admin',
  component: SceneRouteBridge,
  validateSearch: (search) => adminSearchSchema.parse(search),
  beforeLoad: ({context, location}) => {
    requireAuthenticated({context, location});

    if (!context.auth.isAdmin && !context.auth.userRoles.includes('ROLE_ADMIN')) {
      throw redirect({to: '/schedule', replace: true});
    }
  },
});

const routeTree = rootRoute.addChildren([
  authLayoutRoute.addChildren([loginRoute, registerRoute]),
  appLayoutRoute.addChildren([
    indexRoute,
    scheduleRoute,
    scheduleRoomRoute,
    myBookingsRoute,
    bookingConfirmedRoute,
    adminRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  context: {
    auth: {
      isAuthenticated: false,
      isAdmin: false,
      userRoles: [],
    },
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
