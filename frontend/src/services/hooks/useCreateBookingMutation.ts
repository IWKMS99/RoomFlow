import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createBooking} from '../api';
import {queryKeys} from '../queryKeys';
import type {CreateBookingPayload} from '../../types/booking';

export const useCreateBookingMutation = (dateKey: string, roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBookingPayload) => createBooking(payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.myBookings()}),
        queryClient.invalidateQueries({queryKey: queryKeys.schedule(dateKey)}),
        queryClient.invalidateQueries({queryKey: queryKeys.room(roomId, dateKey)}),
      ]);
    },
  });
};
