import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createBooking} from '../api';
import {queryKeys} from '../queryKeys';
import type {CreateBookingPayload, ScheduleView} from '../../types/booking';
import {timeToMinutes} from '../../features/booking/lib/timeSlots';

interface OptimisticContext {
  previousSchedule?: ScheduleView;
}

const toSlotTime = (dateTime: string) => {
  const value = dateTime.slice(11, 16);
  return value.length === 5 ? value : dateTime;
};

const applyOptimisticBooking = (schedule: ScheduleView, payload: CreateBookingPayload): ScheduleView => {
  const start = toSlotTime(payload.startTime);
  const end = toSlotTime(payload.endTime);
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  return {
    ...schedule,
    timeSlots: schedule.timeSlots.map((slot) => {
      const slotTime = slot.time.slice(0, 5);
      const slotMinutes = timeToMinutes(slotTime);
      const slotEnd = slotMinutes + 30;
      const intersects = slotMinutes < endMinutes && slotEnd > startMinutes;
      if (!intersects) {
        return slot;
      }

      return {
        ...slot,
        rooms: slot.rooms.map((room) =>
          room.roomId === payload.roomId ? {...room, isAvailable: false} : room
        ),
      };
    }),
  };
};

export const useCreateBookingMutation = (dateKey: string, roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({queryKey: queryKeys.schedule(dateKey)});
      const previousSchedule = queryClient.getQueryData<ScheduleView>(queryKeys.schedule(dateKey));

      if (previousSchedule) {
        queryClient.setQueryData<ScheduleView>(queryKeys.schedule(dateKey), applyOptimisticBooking(previousSchedule, payload));
      }

      return {previousSchedule} satisfies OptimisticContext;
    },
    onError: (_error, _payload, context) => {
      if (context?.previousSchedule) {
        queryClient.setQueryData<ScheduleView>(queryKeys.schedule(dateKey), context.previousSchedule);
      }
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.myBookings()}),
        queryClient.invalidateQueries({queryKey: queryKeys.schedule(dateKey)}),
        queryClient.invalidateQueries({queryKey: queryKeys.room(roomId, dateKey)}),
      ]);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({queryKey: queryKeys.schedule(dateKey)});
    },
  });
};
