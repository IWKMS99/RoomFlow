import {useQuery} from '@tanstack/react-query';
import {getRoomFiles} from '../api';
import {queryKeys} from '../queryKeys';

export const useRoomFilesQuery = (roomId: string, enabled = true) =>
  useQuery({
    queryKey: queryKeys.roomFiles(roomId),
    queryFn: () => getRoomFiles(roomId),
    staleTime: 15_000,
    gcTime: 10 * 60_000,
    enabled,
  });
