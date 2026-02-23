import {describe, expect, it, beforeEach} from 'vitest';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {render, waitFor} from '@testing-library/react';
import {useRouteSceneSync} from '../useRouteSceneSync';
import {useHubStore} from '../../store/useHubStore';

const Probe = () => {
  useRouteSceneSync();
  return null;
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
    render(
      <MemoryRouter initialEntries={['/schedule/room/r-7']}>
        <Routes>
          <Route path="/schedule/room/:roomId" element={<Probe />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useHubStore.getState().viewMode).toBe('room_detail');
      expect(useHubStore.getState().activeRoomId).toBe('r-7');
      expect(useHubStore.getState().depthLevel).toBe(1);
      expect(useHubStore.getState().cameraPose).toBe('room');
    });
  });

  it('syncs my-bookings route to store', async () => {
    render(
      <MemoryRouter initialEntries={['/my-bookings']}>
        <Routes>
          <Route path="/my-bookings" element={<Probe />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useHubStore.getState().viewMode).toBe('my_bookings');
      expect(useHubStore.getState().activeRoomId).toBeNull();
      expect(useHubStore.getState().depthLevel).toBe(2);
      expect(useHubStore.getState().cameraPose).toBe('bookings');
    });
  });

  it('syncs admin route to store', async () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<Probe />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(useHubStore.getState().viewMode).toBe('admin');
      expect(useHubStore.getState().activeRoomId).toBeNull();
      expect(useHubStore.getState().depthLevel).toBe(3);
      expect(useHubStore.getState().cameraPose).toBe('admin');
    });
  });
});
