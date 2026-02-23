import {useEffect} from 'react';
import {useLocation, useMatchRoute} from '@tanstack/react-router';
import {useHubStore} from '../store/useHubStore';

export const useRouteSceneSync = () => {
  const location = useLocation();
  const matchRoute = useMatchRoute();
  const roomMatch = matchRoute({to: '/schedule/room/$roomId'});
  const syncFromRoute = useHubStore((state) => state.syncFromRoute);
  const roomId = roomMatch ? roomMatch.roomId : undefined;

  useEffect(() => {
    syncFromRoute(location.pathname, roomId ? {roomId} : undefined);
  }, [location.pathname, roomId, syncFromRoute]);
};
