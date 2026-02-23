import {useMutation, useQueryClient} from '@tanstack/react-query';
import {cancelAdminBooking} from '../api';
import {queryKeys} from '../queryKeys';
import type {AdminBookingFilters} from '../../types/booking';

export const useCancelAdminBookingMutation = (filters: AdminBookingFilters) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (bookingId: string) => cancelAdminBooking(bookingId),
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({queryKey: queryKeys.adminBookings(filters)}),
        queryClient.invalidateQueries({queryKey: queryKeys.myBookings()}),
        queryClient.invalidateQueries({queryKey: queryKeys.schedule(filters.date)}),
      ]);
    },
  });
};
