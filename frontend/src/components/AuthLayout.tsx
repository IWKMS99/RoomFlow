import type React from 'react';
import {AnimatePresence} from 'framer-motion';
import {Outlet, useLocation} from 'react-router-dom';
import PageTransition from './polish/PageTransition';

const AuthLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="rf-bg-stage flex min-h-screen items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,hsl(var(--glow-1)/0.16),transparent_38%),radial-gradient(circle_at_85%_8%,hsl(var(--glow-2)/0.18),transparent_34%)]" />
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition pageKey={location.pathname} intent="standard">
          <Outlet />
        </PageTransition>
      </AnimatePresence>
    </div>
  );
};

export default AuthLayout;
