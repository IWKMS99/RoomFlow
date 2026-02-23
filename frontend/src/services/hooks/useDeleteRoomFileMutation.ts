import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteRoomFile} from '../api';
import {queryKeys} from '../queryKeys';

export const useDeleteRoomFileMutation = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: string) => deleteRoomFile(fileId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: queryKeys.roomFiles(roomId)});
    },
  });
};
