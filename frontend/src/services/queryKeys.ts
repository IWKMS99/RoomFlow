export const queryKeys = {
  schedule: (date: string) => ['schedule', date] as const,
  room: (roomId: string, date: string) => ['room', roomId, date] as const,
  myBookings: () => ['myBookings'] as const,
  adminUsers: () => ['adminUsers'] as const,
};
