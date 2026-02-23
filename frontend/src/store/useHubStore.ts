import {create} from 'zustand';

export type HubViewMode = 'global' | 'room_detail' | 'my_bookings' | 'admin' | 'profile';
export type HubDepthLevel = 0 | 1 | 2 | 3;
export type CameraPose = 'global' | 'room' | 'bookings' | 'admin';

interface HubState {
  viewMode: HubViewMode;
  activeRoomId: string | null;
  depthLevel: HubDepthLevel;
  selectedDateKey: string;
  cameraPose: CameraPose;
  setSelectedDateKey: (dateKey: string) => void;
  setCameraPose: (pose: CameraPose) => void;
  enterRoom: (roomId: string) => void;
  exitRoom: () => void;
  openBookings: () => void;
  closeBookings: () => void;
  enterAdmin: () => void;
  leaveAdmin: () => void;
  resetToGlobal: () => void;
  syncFromRoute: (pathname: string, params?: Record<string, string>) => void;
}

export const routeToState = (pathname: string, params?: Record<string, string>) => {
  if (pathname.startsWith('/schedule/room/')) {
    const roomId = params?.roomId ?? pathname.split('/').at(-1) ?? null;
    return {
      viewMode: 'room_detail' as const,
      depthLevel: 1 as HubDepthLevel,
      activeRoomId: roomId,
      cameraPose: 'room' as CameraPose,
    };
  }

  if (pathname.startsWith('/my-bookings')) {
    return {
      viewMode: 'my_bookings' as const,
      depthLevel: 2 as HubDepthLevel,
      activeRoomId: null,
      cameraPose: 'bookings' as CameraPose,
    };
  }

  if (pathname.startsWith('/admin')) {
    return {viewMode: 'admin' as const, depthLevel: 3 as HubDepthLevel, activeRoomId: null, cameraPose: 'admin' as CameraPose};
  }

  return {viewMode: 'global' as const, depthLevel: 0 as HubDepthLevel, activeRoomId: null, cameraPose: 'global' as CameraPose};
};

export const useHubStore = create<HubState>((set) => ({
  viewMode: 'global',
  activeRoomId: null,
  depthLevel: 0,
  selectedDateKey: '',
  cameraPose: 'global',
  setSelectedDateKey: (selectedDateKey) => set({selectedDateKey}),
  setCameraPose: (cameraPose) => set({cameraPose}),
  enterRoom: (roomId) => set({viewMode: 'room_detail', activeRoomId: roomId, depthLevel: 1, cameraPose: 'room'}),
  exitRoom: () => set({viewMode: 'global', activeRoomId: null, depthLevel: 0, cameraPose: 'global'}),
  openBookings: () => set({viewMode: 'my_bookings', depthLevel: 2, cameraPose: 'bookings'}),
  closeBookings: () => set({viewMode: 'global', activeRoomId: null, depthLevel: 0, cameraPose: 'global'}),
  enterAdmin: () => set({viewMode: 'admin', activeRoomId: null, depthLevel: 3, cameraPose: 'admin'}),
  leaveAdmin: () => set({viewMode: 'global', activeRoomId: null, depthLevel: 0, cameraPose: 'global'}),
  resetToGlobal: () => set({viewMode: 'global', activeRoomId: null, depthLevel: 0, cameraPose: 'global'}),
  syncFromRoute: (pathname, params) => set(routeToState(pathname, params)),
}));
