import {useQuery} from '@tanstack/react-query';
import {getAdminRooms} from '../api';
import {queryKeys} from '../queryKeys';
import type {AdminRoomsFilters} from '../../types/adminRooms';

export const useAdminRoomsQuery = (filters: AdminRoomsFilters, enabled = true) =>
  useQuery({
    queryKey: queryKeys.adminRooms(filters),
    queryFn: () => getAdminRooms(filters),
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    enabled,
  });
