// Synced with backend Constants.Schedule
export const WORKING_DAY_START = '09:00';
export const WORKING_DAY_END = '18:00';
export const MAX_BOOKING_HOURS = 4;
export const SLOT_INTERVAL_MINUTES = 30;

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const BOOKING_BOUNDARY_POINTS: string[] = (() => {
  const start = timeToMinutes(WORKING_DAY_START);
  const end = timeToMinutes(WORKING_DAY_END);
  const points: string[] = [];
  for (let minute = start; minute <= end; minute += SLOT_INTERVAL_MINUTES) {
    points.push(minutesToTime(minute));
  }
  return points;
})();
