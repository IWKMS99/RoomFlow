import {useMutation, useQueryClient} from '@tanstack/react-query';
import {updateAdminRoom} from '../api';

export const useUpdateAdminRoomMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({roomId, payload}: {roomId: string; payload: {name: string; floor: number; capacity: number}}) =>
      updateAdminRoom(roomId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: ['adminRooms']});
    },
  });
};
