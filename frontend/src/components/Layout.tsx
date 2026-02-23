import React from 'react';
import {Toaster} from 'react-hot-toast';
import {Outlet, useLocation, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {useAuth} from '../context/useAuth';
import {useRouteSceneSync} from '../hooks/useRouteSceneSync';
import {useHubStore} from '../store/useHubStore';
import HubLayer from '../layers/HubLayer/HubLayer';
import OverlayLayer from '../layers/OverlayLayer/OverlayLayer';
import NavigationLayer from '../layers/NavigationLayer/NavigationLayer';

const Layout: React.FC = () => {
  const {isLoading, token} = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useRouteSceneSync();

  React.useEffect(() => {
    document.documentElement.classList.remove('light');
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

  if (isLoading) {
    return null;
  }

  const isDetailView =
    location.pathname.includes('/room/') ||
    location.pathname.includes('/my-bookings') ||
    location.pathname.includes('/admin');

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-background text-foreground selection:bg-primary/30">
      <Toaster position="top-right" />

      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black" />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <motion.div
        className="relative z-10 h-full w-full"
        animate={{
          scale: isDetailView ? 0.965 : 1,
          filter: isDetailView ? 'blur(12px) brightness(0.72)' : 'blur(0px) brightness(1)',
          opacity: isDetailView ? 0.82 : 1,
        }}
        transition={{type: 'spring', stiffness: 240, damping: 26}}
      >
        <HubLayer />
      </motion.div>

      <OverlayLayer />
      <NavigationLayer />

      {location.pathname.startsWith('/booking/confirmed') ? (
        <div className="fixed inset-0 z-50 overflow-auto px-4 py-20">
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
