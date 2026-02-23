import React from 'react';
import {Toaster} from 'react-hot-toast';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {AnimatePresence, LayoutGroup, motion, useReducedMotion} from 'framer-motion';
import {useAuth} from '../context/useAuth';
import {useRouteSceneSync} from '../hooks/useRouteSceneSync';
import {type ThemeMode, useTheme} from '../hooks/useTheme';
import {useHubStore} from '../store/useHubStore';
import HubLayer from '../layers/HubLayer/HubLayer';
import OverlayLayer from '../layers/OverlayLayer/OverlayLayer';
import NavigationLayer from '../layers/NavigationLayer/NavigationLayer';
import {cn} from '../lib/utils';

interface ThemeRippleState {
  id: number;
  x: number;
  y: number;
  radius: number;
  nextTheme: ThemeMode;
}

const Layout: React.FC = () => {
  const {isLoading, token} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const {theme, setTheme, toggleTheme} = useTheme();
  const [themeRipple, setThemeRipple] = React.useState<ThemeRippleState | null>(null);
  const timeoutsRef = React.useRef<number[]>([]);

  useRouteSceneSync();

  React.useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  React.useEffect(() => {
    if (!token && (location.pathname.startsWith('/my-bookings') || location.pathname.startsWith('/admin'))) {
      useHubStore.getState().resetToGlobal();
      navigate('/login', {replace: true, state: {from: location}});
    }
  }, [location, navigate, token]);

  React.useEffect(
    () => () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current = [];
    },
    []
  );

  if (isLoading) {
    return null;
  }

  const isDetailView =
    location.pathname.includes('/room/') ||
    location.pathname.includes('/my-bookings') ||
    location.pathname.includes('/admin');

  const handleThemeToggle = (origin?: {x: number; y: number}) => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';
    if (reducedMotion || !origin) {
      toggleTheme();
      return;
    }

    const maxX = Math.max(origin.x, window.innerWidth - origin.x);
    const maxY = Math.max(origin.y, window.innerHeight - origin.y);
    const radius = Math.hypot(maxX, maxY) + 48;
    const rippleId = Date.now();
    const rippleDuration = 680;

    setThemeRipple({id: rippleId, x: origin.x, y: origin.y, radius, nextTheme});

    const applyTimeout = window.setTimeout(() => {
      setTheme(nextTheme);
    }, Math.round(rippleDuration * 0.72));
    const clearTimeoutId = window.setTimeout(() => {
      setThemeRipple((state) => (state?.id === rippleId ? null : state));
    }, rippleDuration + 120);

    timeoutsRef.current.push(applyTimeout, clearTimeoutId);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <Toaster position="top-right" />

      <div className={cn('absolute inset-0 z-base rf-stage-surface', theme === 'light' ? 'rf-stage-surface--light' : 'rf-stage-surface--dark')} />
      <div className={cn('absolute inset-0 z-base rf-stage-grid', theme === 'light' ? 'rf-stage-grid--light' : 'rf-stage-grid--dark')} />

      <AnimatePresence>
        {themeRipple && (
          <motion.div
            key={themeRipple.id}
            className="pointer-events-none absolute inset-0 z-themeRipple"
            initial={{clipPath: `circle(0px at ${themeRipple.x}px ${themeRipple.y}px)`}}
            animate={{clipPath: `circle(${themeRipple.radius}px at ${themeRipple.x}px ${themeRipple.y}px)`}}
            exit={{opacity: 0}}
            transition={{duration: 0.68, ease: [0.2, 0.92, 0.24, 1]}}
          >
            <div
              className={cn(
                'absolute inset-0 rf-stage-surface',
                themeRipple.nextTheme === 'light' ? 'rf-stage-surface--light' : 'rf-stage-surface--dark'
              )}
            />
            <div
              className={cn(
                'absolute inset-0 rf-stage-grid',
                themeRipple.nextTheme === 'light' ? 'rf-stage-grid--light' : 'rf-stage-grid--dark'
              )}
            />
            <motion.div
              aria-hidden="true"
              className="absolute inset-0"
              initial={{opacity: 0.44, scale: 0.88}}
              animate={{opacity: 0, scale: 1.14}}
              transition={{duration: 0.68, ease: 'easeOut'}}
              style={{
                background: `radial-gradient(circle at ${themeRipple.x}px ${themeRipple.y}px, hsl(var(--primary)/0.22), transparent 56%)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <LayoutGroup id="scene-shared-layout">
        <motion.div
          className="relative z-content h-full w-full"
          animate={{
            scale: isDetailView ? 0.965 : 1,
            // filter и opacity удалены отсюда, чтобы не ломать GPU-рендеринг вложенных карточек
          }}
          transition={{type: 'spring', stiffness: 240, damping: 26}}
        >
          <HubLayer />
        </motion.div>

        {/* Единый глобальный слой размытия, который аккуратно перекрывает HubLayer */}
        <motion.div
          className="pointer-events-none fixed inset-0 z-popover bg-black/20 backdrop-blur-[8px]"
          initial={false}
          animate={{
            opacity: isDetailView ? 1 : 0,
            visibility: isDetailView ? 'visible' : 'hidden',
          }}
          transition={{duration: 0.3}}
        />

        <OverlayLayer />
        <NavigationLayer theme={theme} onToggleTheme={handleThemeToggle} />
      </LayoutGroup>

      {location.pathname.startsWith('/booking/confirmed') ? (
        <div className="fixed inset-0 z-dock overflow-auto px-4 py-20">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Layout;