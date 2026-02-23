import {beforeEach, describe, expect, it} from 'vitest';
import {Outlet, RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter} from '@tanstack/react-router';
import {render, waitFor} from '@testing-library/react';
import {useRouteSceneSync} from '../useRouteSceneSync';
import {useHubStore} from '../../store/useHubStore';

const Probe = () => {
  useRouteSceneSync();
  return null;
};

const buildTestRouter = (initialPath: string) => {
  const rootRoute = createRootRoute({
    component: Outlet,
  });

  const scheduleRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedule',
    component: Probe,
  });

  const roomRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/schedule/room/$roomId',
    component: Probe,
  });

  const bookingsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/my-bookings',
    component: Probe,
  });

  const adminRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/admin',
    component: Probe,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([scheduleRoute, roomRoute, bookingsRoute, adminRoute]),
    history: createMemoryHistory({initialEntries: [initialPath]}),
  });

  return router;
};

describe('useRouteSceneSync', () => {
  beforeEach(() => {
    useHubStore.setState({
      viewMode: 'global',
      activeRoomId: null,
      depthLevel: 0,
      selectedDateKey: '',
      cameraPose: 'global',
    });
  });

  it('syncs room route to store', async () => {
    const router = buildTestRouter('/schedule/room/r-7');

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(useHubStore.getState().viewMode).toBe('room_detail');
      expect(useHubStore.getState().activeRoomId).toBe('r-7');
      expect(useHubStore.getState().depthLevel).toBe(1);
      expect(useHubStore.getState().cameraPose).toBe('room');
    });
  });

  it('syncs my-bookings route to store', async () => {
    const router = buildTestRouter('/my-bookings');

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(useHubStore.getState().viewMode).toBe('my_bookings');
      expect(useHubStore.getState().activeRoomId).toBeNull();
      expect(useHubStore.getState().depthLevel).toBe(2);
      expect(useHubStore.getState().cameraPose).toBe('bookings');
    });
  });

  it('syncs admin route to store', async () => {
    const router = buildTestRouter('/admin');

    render(<RouterProvider router={router} />);

    await waitFor(() => {
      expect(useHubStore.getState().viewMode).toBe('admin');
      expect(useHubStore.getState().activeRoomId).toBeNull();
      expect(useHubStore.getState().depthLevel).toBe(3);
      expect(useHubStore.getState().cameraPose).toBe('admin');
    });
  });
});
