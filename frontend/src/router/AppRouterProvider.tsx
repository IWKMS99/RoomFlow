import {RouterProvider} from '@tanstack/react-router';
import React from 'react';
import {useAuth} from '../context/useAuth';
import {router} from './index';

const RouterDevtools = import.meta.env.DEV
  ? React.lazy(() => import('@tanstack/react-router-devtools').then((module) => ({default: module.TanStackRouterDevtools})))
  : null;

const AppRouterProvider = () => {
  const {isLoading, isAuthenticated, isAdmin, user} = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      <RouterProvider
        router={router}
        context={{
          auth: {
            isAuthenticated,
            isAdmin,
            userRoles: user?.roles ?? [],
          },
        }}
      />
      {RouterDevtools && (
        <React.Suspense fallback={null}>
          <RouterDevtools router={router} position="bottom-right" />
        </React.Suspense>
      )}
    </>
  );
};

export default AppRouterProvider;
