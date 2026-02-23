import {useNavigate} from 'react-router-dom';
import {useQueryClient} from '@tanstack/react-query';
import DockNav from '../../components/polish/DockNav';
import LagCursor from '../../components/motion/LagCursor';
import {useAuth} from '../../context/useAuth';
import {useHubStore} from '../../store/useHubStore';
import {queryKeys} from '../../services/queryKeys';
import {fetchSchedule, getMyBookings, getAdminUsers, getAdminBookings} from '../../services/api';
import type {ThemeMode} from '../../hooks/useTheme';

interface Props {
  theme: ThemeMode;
  onToggleTheme: () => void;
}

const NavigationLayer = ({theme, onToggleTheme}: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {isAuthenticated, isAdmin, user, logout} = useAuth();
  const selectedDateKey = useHubStore((state) => state.selectedDateKey);

  const handleLogout = async () => {
    await logout();
    useHubStore.getState().resetToGlobal();
    navigate('/login');
  };

  const prefetchByRoute = (route: string) => {
    if (route === '/schedule' && selectedDateKey) {
      void queryClient.prefetchQuery({
        queryKey: queryKeys.schedule(selectedDateKey),
        queryFn: () => fetchSchedule(selectedDateKey),
        staleTime: 30_000,
      });
      return;
    }

    if (route === '/my-bookings') {
      void queryClient.prefetchQuery({queryKey: queryKeys.myBookings(), queryFn: getMyBookings, staleTime: 15_000});
      return;
    }

    if (route === '/admin') {
      void queryClient.prefetchQuery({queryKey: queryKeys.adminUsers(), queryFn: getAdminUsers, staleTime: 30_000});
      if (selectedDateKey) {
        void queryClient.prefetchQuery({
          queryKey: queryKeys.adminBookings({date: selectedDateKey}),
          queryFn: () => getAdminBookings({date: selectedDateKey}),
          staleTime: 15_000,
        });
      }
    }
  };

  return (
    <>
      <DockNav
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        userEmail={user?.email}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogout={handleLogout}
        onRouteHover={prefetchByRoute}
      />
      <LagCursor />
    </>
  );
};

export default NavigationLayer;
