import {useQuery} from '@tanstack/react-query';
import {getAdminBookings} from '../api';
import {queryKeys} from '../queryKeys';
import type {AdminBookingFilters} from '../../types/booking';

export const useAdminBookingsQuery = (filters: AdminBookingFilters, enabled = true) =>
  useQuery({
    queryKey: queryKeys.adminBookings(filters),
    queryFn: () => getAdminBookings(filters),
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    enabled,
  });
