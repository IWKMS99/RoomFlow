import {MAX_BOOKING_HOURS, SLOT_INTERVAL_MINUTES, WORKING_DAY_END, WORKING_DAY_START} from './bookingConstants';
import {isContiguousSlots, sortSlots, timeToMinutes} from './timeSlots';
import i18n from '../../../i18n';

interface ValidationOptions {
  daySlots: string[];
  availableSlots: Set<string>;
  maxHours?: number;
  workingDayStart?: string;
  workingDayEnd?: string;
}

export interface SlotRangeValidationResult {
  ok: boolean;
  reason?: string;
}

export const validateSlotRange = (
  range: string[],
  {
    daySlots,
    availableSlots,
    maxHours = MAX_BOOKING_HOURS,
    workingDayStart = WORKING_DAY_START,
    workingDayEnd = WORKING_DAY_END,
  }: ValidationOptions
): SlotRangeValidationResult => {
  if (range.length === 0) {
    return {ok: false, reason: i18n.t('booking.validation.selectAtLeastOne')};
  }

  const sortedRange = sortSlots(range);
  const uniqueRange = [...new Set(sortedRange)];

  if (uniqueRange.length !== sortedRange.length) {
    return {ok: false, reason: i18n.t('booking.validation.noDuplicates')};
  }

  if (!isContiguousSlots(uniqueRange)) {
    return {ok: false, reason: i18n.t('booking.validation.contiguous')};
  }

  const daySet = new Set(daySlots);
  if (uniqueRange.some((slot) => !daySet.has(slot))) {
    return {ok: false, reason: i18n.t('booking.validation.outOfSchedule')};
  }

  if (uniqueRange.some((slot) => timeToMinutes(slot) < timeToMinutes(workingDayStart))) {
    return {ok: false, reason: i18n.t('booking.validation.beforeWorkingDay')};
  }

  if (uniqueRange.some((slot) => !availableSlots.has(slot))) {
    return {ok: false, reason: i18n.t('booking.validation.alreadyBusy')};
  }

  const anchor = uniqueRange[0];
  const anchorIndex = daySlots.indexOf(anchor);
  if (anchorIndex === -1) {
    return {ok: false, reason: i18n.t('booking.validation.anchorUnavailable')};
  }

  const workEndLimit = timeToMinutes(workingDayEnd) - SLOT_INTERVAL_MINUTES;
  let dayEndIndex = -1;
  for (let index = daySlots.length - 1; index >= 0; index -= 1) {
    if (timeToMinutes(daySlots[index]) <= workEndLimit) {
      dayEndIndex = index;
      break;
    }
  }
  if (dayEndIndex === -1 || dayEndIndex < anchorIndex) {
    return {ok: false, reason: i18n.t('booking.validation.outOfWorkingDay')};
  }

  let continuousAvailableCount = 0;
  for (let index = anchorIndex; index <= dayEndIndex; index += 1) {
    const slot = daySlots[index];
    if (!availableSlots.has(slot)) {
      break;
    }
    continuousAvailableCount += 1;
  }

  const rangeMinutes = uniqueRange.length * SLOT_INTERVAL_MINUTES;
  const continuousAvailableMinutes = continuousAvailableCount * SLOT_INTERVAL_MINUTES;
  const durationLimitMinutes = Math.min(maxHours * 60, continuousAvailableMinutes);

  if (rangeMinutes > durationLimitMinutes) {
    return {ok: false, reason: i18n.t('booking.validation.exceedsLimit')};
  }

  return {ok: true};
};
