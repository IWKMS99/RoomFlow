import {useMutation, useQueryClient} from '@tanstack/react-query';
import {cancelBooking} from '../api';
import {queryKeys} from '../queryKeys';
import type {BookingResponse} from '../../types/booking';

export const useCancelBookingMutation = (dateKey: string, roomId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onMutate: async (bookingId: string) => {
      await queryClient.cancelQueries({queryKey: queryKeys.myBookings()});
      const previous = queryClient.getQueryData<BookingResponse[]>(queryKeys.myBookings());

      queryClient.setQueryData<BookingResponse[]>(queryKeys.myBookings(), (current = []) =>
        current.map((booking) => (booking.id === bookingId ? {...booking, status: 'CANCELLED'} : booking))
      );

      return {previous};
    },
    onError: (_error, _bookingId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKeys.myBookings(), context.previous);
      }
    },
    onSettled: async () => {
      const invalidations = [
        queryClient.invalidateQueries({queryKey: queryKeys.myBookings()}),
        queryClient.invalidateQueries({queryKey: queryKeys.schedule(dateKey)}),
      ];
      if (roomId) {
        invalidations.push(queryClient.invalidateQueries({queryKey: queryKeys.room(roomId, dateKey)}));
      }
      await Promise.all(invalidations);
    },
  });
};
