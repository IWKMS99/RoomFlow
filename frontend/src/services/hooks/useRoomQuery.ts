import {useQuery} from '@tanstack/react-query';
import {getRoomById} from '../api';
import {queryKeys} from '../queryKeys';

export const useRoomQuery = (roomId?: string | null) =>
  useQuery({
    queryKey: queryKeys.roomById(roomId ?? ''),
    queryFn: () => getRoomById(roomId!),
    enabled: Boolean(roomId),
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });
