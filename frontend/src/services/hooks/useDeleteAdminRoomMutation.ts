import {useMutation, useQueryClient} from '@tanstack/react-query';
import {deleteAdminRoom} from '../api';

export const useDeleteAdminRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => deleteAdminRoom(roomId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['adminRooms']});
    },
  });
};
