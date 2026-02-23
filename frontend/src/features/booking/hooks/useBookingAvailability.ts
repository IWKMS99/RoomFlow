import {useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import type {ScheduleView} from '../../../types/booking';
import {buildRange, getAvailableSlotsForRoom, getDaySlots, sortSlots, timeToMinutes} from '../lib/timeSlots';
import {validateSlotRange} from '../lib/validateSlotRange';
import {MAX_BOOKING_HOURS, WORKING_DAY_END} from '../lib/bookingConstants';

interface BookingAvailabilityOptions {
  schedule: ScheduleView | null;
  selectedSlots: string[];
  anchorSlot?: string | null;
  selectedDate: Date;
  roomId: string | null;
  maxHours?: number;
  workingDayEnd?: string;
}

export interface BookingAvailability {
  daySlots: string[];
  isSlotDisabled: (time: string) => boolean;
  getSlotDisableReason: (time: string) => string | undefined;
  isSlotSelected: (time: string) => boolean;
  getSelectableSlots: () => string[];
  buildSelectionFromAnchor: (targetTime: string) => string[];
  getAnchor: () => string | null;
  selectionHint?: string;
}

export const useBookingAvailability = ({
  schedule,
  selectedSlots,
  anchorSlot,
  selectedDate,
  roomId,
  maxHours = MAX_BOOKING_HOURS,
  workingDayEnd = WORKING_DAY_END,
}: BookingAvailabilityOptions): BookingAvailability => {
  const {t} = useTranslation();
  const daySlots = useMemo(() => getDaySlots(schedule), [schedule]);
  const availableSlots = useMemo(() => getAvailableSlotsForRoom(schedule, roomId), [schedule, roomId]);
  const selectedSorted = useMemo(() => sortSlots(selectedSlots), [selectedSlots]);
  const now = new Date();
  const isToday =
    selectedDate.getFullYear() === now.getFullYear() &&
    selectedDate.getMonth() === now.getMonth() &&
    selectedDate.getDate() === now.getDate();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const anchor = anchorSlot ?? selectedSorted[0] ?? null;
  const selectionHint = roomId ? undefined : t('booking.selectionHint');

  const buildSelectionFromAnchor = (targetTime: string) => {
    if (!anchor) {
      return [targetTime];
    }
    return buildRange(daySlots, anchor, targetTime);
  };

  const getSlotDisableReason = (time: string) => {
    if (isToday && timeToMinutes(time) <= nowMinutes) {
      return t('booking.disable.past');
    }

    if (!roomId) {
      return t('booking.disable.selectRoom');
    }

    const timeIndex = daySlots.indexOf(time);
    if (timeIndex === -1) {
      return t('booking.disable.outOfSchedule');
    }

    const workEndStart = timeToMinutes(workingDayEnd) - 60;
    if (timeToMinutes(time) > workEndStart) {
      return t('booking.disable.outOfWorkingDay');
    }

    if (!availableSlots.has(time)) {
      return t('booking.disable.alreadyBusy');
    }

    if (!anchor) {
      return undefined;
    }

    if (time === anchor) {
      return undefined;
    }

    const candidateRange = buildRange(daySlots, anchor, time);
    const validation = validateSlotRange(candidateRange, {
      daySlots,
      availableSlots,
      maxHours,
      workingDayEnd,
    });

    if (!validation.ok) {
      return validation.reason;
    }

    return undefined;
  };

  const isSlotDisabled = (time: string) => Boolean(getSlotDisableReason(time));

  const isSlotSelected = (time: string) => selectedSorted.includes(time);

  const getSelectableSlots = () => daySlots.filter((time) => !isSlotDisabled(time));

  return {
    daySlots,
    isSlotDisabled,
    getSlotDisableReason,
    isSlotSelected,
    getSelectableSlots,
    buildSelectionFromAnchor,
    getAnchor: () => anchor,
    selectionHint,
  };
};
