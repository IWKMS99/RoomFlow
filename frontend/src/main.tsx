import React from 'react';
import ReactDOM from 'react-dom/client';
import {createBrowserRouter, Navigate, RouterProvider} from 'react-router-dom';
import {QueryClientProvider} from '@tanstack/react-query';

import './index.css';
import './i18n';
import {AuthProvider} from './context/AuthContext.tsx';

import Layout from './components/Layout.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AuthLayout from './components/AuthLayout.tsx';
import GuestOnlyRoute from './components/GuestOnlyRoute.tsx';
import ConfirmationPage from './pages/ConfirmationPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import RoleProtectedRoute from './components/RoleProtectedRoute.tsx';
import SceneRouteBridge from './pages/SceneRouteBridge.tsx';
import {queryClient} from './services/queryClient.ts';

const Devtools = import.meta.env.DEV
  ? React.lazy(() => import('@tanstack/react-query-devtools').then((module) => ({default: module.ReactQueryDevtools})))
  : null;

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        element: <GuestOnlyRoute />,
        children: [
          {
            path: '/login',
            element: <LoginPage />,
          },
          {
            path: '/register',
            element: <RegisterPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/schedule" replace />,
      },
      {
        path: 'schedule',
        element: <SceneRouteBridge />,
      },
      {
        path: 'schedule/room/:roomId',
        element: <SceneRouteBridge />,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'my-bookings',
            element: <SceneRouteBridge />,
          },
          {
            path: 'booking/confirmed',
            element: <ConfirmationPage />,
          },
        ],
      },
      {
        element: <RoleProtectedRoute allowedRoles={['ROLE_ADMIN']} />,
        children: [
          {
            path: 'admin',
            element: <SceneRouteBridge />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
      {Devtools && (
        <React.Suspense fallback={null}>
          <Devtools initialIsOpen={false} buttonPosition="bottom-left" />
        </React.Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>
);
