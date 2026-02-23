import {useEffect} from 'react';
import {useLocation, useMatch} from 'react-router-dom';
import {useHubStore} from '../store/useHubStore';

export const useRouteSceneSync = () => {
  const location = useLocation();
  const roomMatch = useMatch('/schedule/room/:roomId');
  const syncFromRoute = useHubStore((state) => state.syncFromRoute);
  const roomId = roomMatch?.params.roomId;

  useEffect(() => {
    syncFromRoute(location.pathname, roomId ? {roomId} : undefined);
  }, [location.pathname, roomId, syncFromRoute]);
};
