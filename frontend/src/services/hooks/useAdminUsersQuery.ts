import {useQuery} from '@tanstack/react-query';
import {getAdminUsers} from '../api';
import {queryKeys} from '../queryKeys';

export const useAdminUsersQuery = () =>
  useQuery({
    queryKey: queryKeys.adminUsers(),
    queryFn: getAdminUsers,
    staleTime: 30_000,
    gcTime: 10 * 60_000,
  });
