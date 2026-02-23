import {useState} from 'react';
import toast from 'react-hot-toast';
import {createBooking} from '../../../services/api';
import {formatLocalDateTime} from '../../../lib/datetime/formatLocalDateTime';
import {getApiErrorMessage, getApiStatus, getValidationViolationMessage} from '../../../lib/httpError';
import {reconcileSelectionAfterConflict} from '../../booking/lib/reconcileSelectionAfterConflict';
import {buildSlotsFromRange} from '../../booking/lib/bookingRange';
import {minutesToTime, sortSlots, timeToMinutes} from '../../booking/lib/timeSlots';
import {SLOT_INTERVAL_MINUTES} from '../../booking/lib/bookingConstants';
import type {ScheduleView} from '../../../types/booking';
import type {DirectSelectionRange} from './useDirectBookingSelection';

interface Params {
  selectedDate: Date;
  getSchedule: () => Promise<ScheduleView>;
  onConflictReconciled: (range: DirectSelectionRange | null) => void;
}

export const useScheduleBooking = ({selectedDate, getSchedule, onConflictReconciled}: Params) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (range: DirectSelectionRange) => {
    setIsSubmitting(true);
    try {
      await createBooking({
        roomId: range.roomId,
        startTime: formatLocalDateTime(selectedDate, range.start),
        endTime: formatLocalDateTime(selectedDate, range.end),
      });
      toast.success('Комната забронирована.');
      onConflictReconciled(null);
      await getSchedule();
    } catch (error: unknown) {
      if (getApiStatus(error) === 409) {
        const refreshedSchedule = await getSchedule();
        const selectedSlots = buildSlotsFromRange(range.start, range.end);
        const reconcile = reconcileSelectionAfterConflict(selectedSlots, refreshedSchedule, range.roomId);

        if (reconcile.adjustedSlots.length === 0) {
          onConflictReconciled(null);
        } else {
          const sortedAdjusted = sortSlots(reconcile.adjustedSlots);
          const adjustedFrom = sortedAdjusted[0];
          const adjustedTo = minutesToTime(
            timeToMinutes(sortedAdjusted[sortedAdjusted.length - 1]) + SLOT_INTERVAL_MINUTES
          );
          onConflictReconciled({
            roomId: range.roomId,
            start: adjustedFrom,
            end: adjustedTo,
            slotCount: sortedAdjusted.length,
          });
        }

        toast.error(
          reconcile.removedSlots.length > 0
            ? `Слот ${reconcile.removedSlots[0]} уже заняли, выбор скорректирован.`
            : 'Часть выбранных слотов уже недоступна.'
        );
        return;
      }

      if (getApiStatus(error) === 400) {
        const validation = getValidationViolationMessage(error, ['startTime', 'endTime']);
        toast.error(validation ?? getApiErrorMessage(error, 'Некорректный диапазон бронирования.'));
        return;
      }

      toast.error(getApiErrorMessage(error, 'Не удалось завершить бронирование.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submit,
    isSubmitting,
  };
};
