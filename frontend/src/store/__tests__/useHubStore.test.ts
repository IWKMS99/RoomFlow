import {beforeEach, describe, expect, it} from 'vitest';
import {routeToState, useHubStore} from '../useHubStore';

describe('useHubStore', () => {
  beforeEach(() => {
    useHubStore.setState({
      viewMode: 'global',
      activeRoomId: null,
      depthLevel: 0,
      selectedDateKey: '',
      cameraPose: 'global',
    });
  });

  it('transitions to room detail and back', () => {
    useHubStore.getState().enterRoom('room-1');
    expect(useHubStore.getState().viewMode).toBe('room_detail');
    expect(useHubStore.getState().activeRoomId).toBe('room-1');
    expect(useHubStore.getState().depthLevel).toBe(1);
    expect(useHubStore.getState().cameraPose).toBe('room');

    useHubStore.getState().exitRoom();
    expect(useHubStore.getState().viewMode).toBe('global');
    expect(useHubStore.getState().activeRoomId).toBeNull();
    expect(useHubStore.getState().depthLevel).toBe(0);
    expect(useHubStore.getState().cameraPose).toBe('global');
  });

  it('maps routes to hub state correctly', () => {
    expect(routeToState('/schedule')).toEqual({viewMode: 'global', depthLevel: 0, activeRoomId: null, cameraPose: 'global'});
    expect(routeToState('/schedule/room/abc', {roomId: 'abc'})).toEqual({
      viewMode: 'room_detail',
      depthLevel: 1,
      activeRoomId: 'abc',
      cameraPose: 'room',
    });
    expect(routeToState('/my-bookings')).toEqual({viewMode: 'my_bookings', depthLevel: 2, activeRoomId: null, cameraPose: 'bookings'});
    expect(routeToState('/admin')).toEqual({viewMode: 'admin', depthLevel: 3, activeRoomId: null, cameraPose: 'admin'});
  });
});
