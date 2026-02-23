import type React from 'react';
import {AnimatePresence, LayoutGroup} from 'framer-motion';
import {useEffect, useRef, useState} from 'react';
import {Outlet, useLocation} from '@tanstack/react-router';
import PageTransition from './polish/PageTransition';

const AuthLayout: React.FC = () => {
  const location = useLocation();
  const prevPathRef = useRef(location.pathname);
  const [direction, setDirection] = useState<-1 | 0 | 1>(0);

  useEffect(() => {
    const order = ['/login', '/register'];
    const prevIdx = order.indexOf(prevPathRef.current);
    const nextIdx = order.indexOf(location.pathname);
    if (prevIdx !== -1 && nextIdx !== -1 && prevIdx !== nextIdx) {
      setDirection(nextIdx > prevIdx ? 1 : -1);
    } else {
      setDirection(0);
    }
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="rf-bg-stage relative flex min-h-screen px-4 py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,hsl(var(--glow-1)/0.16),transparent_38%),radial-gradient(circle_at_85%_8%,hsl(var(--glow-2)/0.18),transparent_34%)]" />
      <div className="relative mx-auto grid w-full max-w-[1200px] place-items-center">
        <LayoutGroup id="auth-route-morph">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition pageKey={location.pathname} intent="standard" direction={direction} isTabNavigation={direction !== 0}>
              <div className="flex w-full justify-center">
                <Outlet />
              </div>
            </PageTransition>
          </AnimatePresence>
        </LayoutGroup>
      </div>
    </div>
  );
};

export default AuthLayout;
