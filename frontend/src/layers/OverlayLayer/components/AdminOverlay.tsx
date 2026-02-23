import {motion, useReducedMotion} from 'framer-motion';
import {Shield} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHubStore} from '../../../store/useHubStore';
import {useAdminUsersQuery} from '../../../services/hooks/useAdminUsersQuery';
import {useUpdateUserRoleMutation} from '../../../services/hooks/useUpdateUserRoleMutation';
import {useAdminBookingsQuery} from '../../../services/hooks/useAdminBookingsQuery';
import {useCancelAdminBookingMutation} from '../../../services/hooks/useCancelAdminBookingMutation';
import MagneticButton from '../../../components/motion/MagneticButton';
import {getApiErrorMessage} from '../../../lib/httpError';
import {motionTokens} from '../../../lib/motionTokens';
import {formatDateForApi, normalizeDate} from '../../../lib/datetime/dateKey';
import type {BookingStatus} from '../../../types/booking';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const AdminOverlay = () => {
  const {i18n} = useTranslation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const cameraPose = useHubStore((state) => state.cameraPose);
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const usersQuery = useAdminUsersQuery();
  const updateRole = useUpdateUserRoleMutation();
  const [statusFilter, setStatusFilter] = React.useState<BookingStatus | ''>('');
  const [roomIdFilter, setRoomIdFilter] = React.useState('');
  const [emailFilter, setEmailFilter] = React.useState('');
  const normalizedRoomFilter = roomIdFilter.trim();
  const roomIdQueryParam = UUID_PATTERN.test(normalizedRoomFilter) ? normalizedRoomFilter : undefined;

  const bookingFilters = React.useMemo(
    () => ({
      date: selectedDateKey,
      roomId: roomIdQueryParam,
      userEmail: emailFilter.trim() || undefined,
      status: statusFilter || undefined,
    }),
    [emailFilter, roomIdQueryParam, selectedDateKey, statusFilter]
  );

  const adminBookingsQuery = useAdminBookingsQuery(bookingFilters);
  const cancelAdminBookingMutation = useCancelAdminBookingMutation(bookingFilters);
  const visibleBookings = React.useMemo(() => {
    const bookings = adminBookingsQuery.data ?? [];
    if (!normalizedRoomFilter || roomIdQueryParam) {
      return bookings;
    }

    const normalized = normalizedRoomFilter.toLowerCase();
    return bookings.filter(
      (booking) =>
        booking.roomName.toLowerCase().includes(normalized) || booking.roomId.toLowerCase().includes(normalized)
    );
  }, [adminBookingsQuery.data, normalizedRoomFilter, roomIdQueryParam]);

  const handleRoleToggle = async (userId: string, role: 'ROLE_USER' | 'ROLE_ADMIN') => {
    try {
      await updateRole.mutateAsync({userId, role});
      toast.success('Роль пользователя обновлена.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Не удалось обновить роль пользователя.'));
    }
  };

  const handleAdminCancel = async (bookingId: string) => {
    try {
      await cancelAdminBookingMutation.mutateAsync(bookingId);
      toast.success('Бронирование отменено администратором.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Не удалось отменить бронирование.'));
    }
  };

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-40 flex items-start justify-center overflow-y-auto p-2 pb-28 pt-6 sm:p-4 sm:pb-32 sm:pt-8"
      initial={reducedMotion ? false : {opacity: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, y: cameraPose === 'admin' ? 0 : -12}}
      exit={reducedMotion ? undefined : {opacity: 0}}
      transition={motionTokens.overlay}
    >
      <motion.div
        layoutId="admin-panel"
        transition={motionTokens.card}
        className="rf-modal flex max-h-[calc(100dvh-8.5rem)] w-full max-w-5xl flex-col rounded-3xl p-4 sm:p-6"
      >
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

        <div className="grid min-h-0 gap-6 lg:grid-cols-2">
          <section className="grid min-h-0 gap-2">
            <h3 className="m-0 text-lg font-semibold text-foreground">Пользователи</h3>
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
              <div className="grid min-h-0 content-start gap-2 overflow-auto pr-1 rf-scrollbar">
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
          </section>

          <section className="flex min-h-0 flex-col gap-3">
            <h3 className="m-0 text-lg font-semibold text-foreground">Все бронирования</h3>

            <div className="grid gap-2 sm:grid-cols-3">
              <input
                type="text"
                placeholder="Фильтр email"
                value={emailFilter}
                onChange={(event) => setEmailFilter(event.target.value)}
                className="rounded-lg border border-white/16 bg-background/40 px-3 py-2 text-xs text-foreground"
              />
              <input
                type="text"
                placeholder="Фильтр комнаты (UUID/название)"
                value={roomIdFilter}
                onChange={(event) => setRoomIdFilter(event.target.value)}
                className="rounded-lg border border-white/16 bg-background/40 px-3 py-2 text-xs text-foreground"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as BookingStatus | '')}
                className="rounded-lg border border-white/16 bg-background/40 px-3 py-2 text-xs text-foreground"
              >
                <option value="">Все статусы</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="REQUESTED">REQUESTED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>

            {adminBookingsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Загрузка бронирований...</p>
            ) : adminBookingsQuery.isError ? (
              <div className="text-sm text-danger">
                Не удалось загрузить бронирования.
                <button type="button" className="ml-2 underline" onClick={() => void adminBookingsQuery.refetch()}>
                  Повторить
                </button>
              </div>
            ) : visibleBookings.length === 0 ? (
              <p className="text-sm text-muted-foreground">На выбранную дату бронирований не найдено.</p>
            ) : (
              <div className="min-h-0 flex-1 space-y-2 overflow-auto pr-1 rf-scrollbar">
                {visibleBookings.map((booking) => (
                  <article key={booking.id} className="rounded-xl border border-white/14 bg-card/60 px-3 py-2">
                    <p className="m-0 text-sm font-semibold text-foreground">{booking.roomName}</p>
                    <p className="m-0 mt-1 text-xs text-muted-foreground">
                      {booking.userEmail} • {new Date(booking.startTime).toLocaleString(locale, {hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'})}
                    </p>
                    <p className="m-0 mt-1 text-xs text-muted-foreground">Статус: {booking.status}</p>
                    {booking.status !== 'CANCELLED' && (
                      <MagneticButton
                        onClick={() => void handleAdminCancel(booking.id)}
                        disabled={cancelAdminBookingMutation.isPending}
                        className="mt-2 rounded-lg border border-danger/45 bg-danger/20 px-3 py-1.5 text-xs font-semibold text-danger"
                      >
                        {cancelAdminBookingMutation.isPending ? 'Отмена...' : 'Отменить'}
                      </MagneticButton>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AdminOverlay;
