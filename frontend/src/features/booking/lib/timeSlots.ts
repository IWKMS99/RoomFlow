import type {ScheduleView} from '../../../types/booking';
import {SLOT_INTERVAL_MINUTES} from './bookingConstants';

export const normalizeTime = (value: string) => value.slice(0, 5);

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = normalizeTime(time).split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (value: number): string => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const getDaySlots = (schedule: ScheduleView | null): string[] => {
  if (!schedule) {
    return [];
  }

  return [...new Set(schedule.timeSlots.map((slot) => normalizeTime(slot.time)))].sort((a, b) =>
    timeToMinutes(a) - timeToMinutes(b)
  );
};

export const getAvailableSlotsForRoom = (schedule: ScheduleView | null, roomId: string | null): Set<string> => {
  if (!schedule || !roomId) {
    return new Set();
  }

  const available = new Set<string>();

  schedule.timeSlots.forEach((slot) => {
    const time = normalizeTime(slot.time);
    const room = slot.rooms.find((candidate) => candidate.roomId === roomId);
    if (room?.isAvailable) {
      available.add(time);
    }
  });

  return available;
};

export const sortSlots = (slots: string[]) => [...slots].sort((a, b) => timeToMinutes(a) - timeToMinutes(b));

export const isContiguousSlots = (slots: string[]): boolean => {
  const sorted = sortSlots(slots);
  for (let index = 1; index < sorted.length; index += 1) {
    if (timeToMinutes(sorted[index]) - timeToMinutes(sorted[index - 1]) !== SLOT_INTERVAL_MINUTES) {
      return false;
    }
  }
  return true;
};

export const buildRange = (slots: string[], anchor: string, target: string): string[] => {
  const sortedSlots = sortSlots(slots);
  const anchorIndex = sortedSlots.indexOf(anchor);
  const targetIndex = sortedSlots.indexOf(target);

  if (anchorIndex === -1 || targetIndex === -1) {
    return [];
  }

  const startIndex = Math.min(anchorIndex, targetIndex);
  const endIndexExclusive = Math.max(anchorIndex, targetIndex);

  if (startIndex === endIndexExclusive) {
    return [sortedSlots[startIndex]];
  }

  return sortedSlots.slice(startIndex, endIndexExclusive);
};
