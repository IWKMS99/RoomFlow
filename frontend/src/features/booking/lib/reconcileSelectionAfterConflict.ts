import type {ScheduleView} from '../../../types/booking';
import {SLOT_INTERVAL_MINUTES} from './bookingConstants';
import {getAvailableSlotsForRoom, sortSlots, timeToMinutes} from './timeSlots';

export interface ReconcileResult {
  adjustedSlots: string[];
  removedSlots: string[];
}

export const reconcileSelectionAfterConflict = (
  selectedSlots: string[],
  schedule: ScheduleView | null,
  roomId: string | null
): ReconcileResult => {
  if (!schedule || !roomId || selectedSlots.length === 0) {
    return {adjustedSlots: [], removedSlots: selectedSlots};
  }

  const available = getAvailableSlotsForRoom(schedule, roomId);
  const filtered = sortSlots(selectedSlots).filter((slot) => available.has(slot));

  if (filtered.length === 0) {
    return {adjustedSlots: [], removedSlots: selectedSlots};
  }

  const adjustedSlots: string[] = [filtered[0]];
  for (let index = 1; index < filtered.length; index += 1) {
    const current = filtered[index];
    const previous = adjustedSlots[adjustedSlots.length - 1];
    if (timeToMinutes(current) - timeToMinutes(previous) === SLOT_INTERVAL_MINUTES) {
      adjustedSlots.push(current);
      continue;
    }
    break;
  }

  const adjustedSet = new Set(adjustedSlots);
  const removedSlots = sortSlots(selectedSlots).filter((slot) => !adjustedSet.has(slot));

  return {adjustedSlots, removedSlots};
};
