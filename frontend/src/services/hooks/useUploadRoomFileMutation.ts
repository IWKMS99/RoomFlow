import {useMutation, useQueryClient} from '@tanstack/react-query';
import {uploadRoomFile} from '../api';
import {queryKeys} from '../queryKeys';

export const useUploadRoomFileMutation = (roomId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => uploadRoomFile(roomId, file),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: queryKeys.roomFiles(roomId)});
    },
  });
};
