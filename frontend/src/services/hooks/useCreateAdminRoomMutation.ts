import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createAdminRoom} from '../api';

export const useCreateAdminRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminRoom,
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['adminRooms']});
    },
  });
};
