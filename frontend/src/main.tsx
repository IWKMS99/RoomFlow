import React from 'react';
import ReactDOM from 'react-dom/client';
import {QueryClientProvider} from '@tanstack/react-query';

import './index.css';
import './i18n';
import {AuthProvider} from './context/AuthContext.tsx';
import {queryClient} from './services/queryClient.ts';
import AppRouterProvider from './router/AppRouterProvider.tsx';

const QueryDevtools = import.meta.env.DEV
  ? React.lazy(() => import('@tanstack/react-query-devtools').then((module) => ({default: module.ReactQueryDevtools})))
  : null;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouterProvider />
      </AuthProvider>
      {QueryDevtools && (
        <React.Suspense fallback={null}>
          <QueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
        </React.Suspense>
      )}
    </QueryClientProvider>
  </React.StrictMode>
);
