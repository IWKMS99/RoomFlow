export const queryKeys = {
  schedule: (date: string) => ['schedule', date] as const,
  room: (roomId: string, date: string) => ['room', roomId, date] as const,
  roomById: (roomId: string) => ['roomById', roomId] as const,
  holidays: (year: number, country: string) => ['holidays', year, country] as const,
  myBookings: () => ['myBookings'] as const,
  adminUsers: () => ['adminUsers'] as const,
  adminBookings: (filters: {date: string; roomId?: string; userEmail?: string; status?: string}) => ['adminBookings', filters] as const,
  adminRooms: (filters: {page: number; size: number; search?: string; floor?: number; minCapacity?: number; sort?: string}) =>
    ['adminRooms', filters] as const,
  roomFiles: (roomId: string) => ['roomFiles', roomId] as const,
};
