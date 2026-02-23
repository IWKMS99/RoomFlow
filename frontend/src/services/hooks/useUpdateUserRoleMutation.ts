import {useMutation, useQueryClient} from '@tanstack/react-query';
import {updateUserRole} from '../api';
import {queryKeys} from '../queryKeys';

export const useUpdateUserRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({userId, role}: {userId: string; role: 'ROLE_USER' | 'ROLE_ADMIN'}) => updateUserRole(userId, role),
    onSuccess: async () => {
      await queryClient.invalidateQueries({queryKey: queryKeys.adminUsers()});
    },
  });
};
