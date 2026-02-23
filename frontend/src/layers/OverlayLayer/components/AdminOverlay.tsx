import {motion, useReducedMotion} from 'framer-motion';
import {Shield} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import {useHubStore} from '../../../store/useHubStore';
import {useAdminUsersQuery} from '../../../services/hooks/useAdminUsersQuery';
import {useUpdateUserRoleMutation} from '../../../services/hooks/useUpdateUserRoleMutation';
import MagneticButton from '../../../components/motion/MagneticButton';
import {getApiErrorMessage} from '../../../lib/httpError';
import {motionTokens} from '../../../lib/motionTokens';

const AdminOverlay = () => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const cameraPose = useHubStore((state) => state.cameraPose);
  const usersQuery = useAdminUsersQuery();
  const updateRole = useUpdateUserRoleMutation();

  const handleRoleToggle = async (userId: string, role: 'ROLE_USER' | 'ROLE_ADMIN') => {
    try {
      await updateRole.mutateAsync({userId, role});
      toast.success('Роль пользователя обновлена.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Не удалось обновить роль пользователя.'));
    }
  };

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4"
      initial={reducedMotion ? false : {opacity: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, y: cameraPose === 'admin' ? 0 : -12}}
      exit={reducedMotion ? undefined : {opacity: 0}}
      transition={motionTokens.overlay}
    >
      <motion.div layoutId="admin-panel" transition={motionTokens.card} className="rf-modal w-full max-w-5xl rounded-3xl p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-foreground">
            <Shield size={22} /> God Mode
          </div>
          <MagneticButton
            onClick={() => {
              useHubStore.getState().leaveAdmin();
              navigate('/schedule');
            }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-foreground"
          >
            Закрыть
          </MagneticButton>
        </div>

        {usersQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка пользователей...</p>
        ) : usersQuery.isError ? (
          <div className="text-sm text-danger">
            Не удалось загрузить список.
            <button type="button" className="ml-2 underline" onClick={() => void usersQuery.refetch()}>
              Повторить
            </button>
          </div>
        ) : (usersQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Список пользователей пуст.</p>
        ) : (
          <div className="grid gap-2">
            {(usersQuery.data ?? []).map((user) => {
              const isAdmin = user.roles.includes('ROLE_ADMIN');
              const nextRole = isAdmin ? 'ROLE_USER' : 'ROLE_ADMIN';
              return (
                <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/14 bg-card/60 px-3 py-2">
                  <p className="m-0 text-sm text-foreground">{user.email}</p>
                  <MagneticButton
                    onClick={() => void handleRoleToggle(user.id, nextRole)}
                    disabled={updateRole.isPending}
                    className="rounded-lg border border-primary/40 bg-primary/18 px-3 py-1.5 text-xs font-semibold text-foreground"
                  >
                    {updateRole.isPending ? 'Сохраняем...' : nextRole === 'ROLE_ADMIN' ? 'Сделать админом' : 'Сделать пользователем'}
                  </MagneticButton>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default AdminOverlay;
