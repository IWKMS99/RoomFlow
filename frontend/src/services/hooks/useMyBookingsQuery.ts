import {useQuery} from '@tanstack/react-query';
import {getMyBookings} from '../api';
import {queryKeys} from '../queryKeys';

export const MY_BOOKINGS_STALE_TIME = 15_000;
export const MY_BOOKINGS_GC_TIME = 10 * 60_000;

export const useMyBookingsQuery = (enabled = true) =>
  useQuery({
    queryKey: queryKeys.myBookings(),
    queryFn: getMyBookings,
    staleTime: MY_BOOKINGS_STALE_TIME,
    gcTime: MY_BOOKINGS_GC_TIME,
    enabled,
  });
