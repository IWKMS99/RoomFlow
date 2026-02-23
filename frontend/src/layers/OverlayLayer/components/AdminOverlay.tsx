import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {Check, ChevronDown, Shield} from 'lucide-react';
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
const STATUS_OPTIONS: Array<{value: BookingStatus | ''; label: string}> = [
  {value: '', label: 'Все статусы'},
  {value: 'CONFIRMED', label: 'CONFIRMED'},
  {value: 'CANCELLED', label: 'CANCELLED'},
  {value: 'REQUESTED', label: 'REQUESTED'},
  {value: 'COMPLETED', label: 'COMPLETED'},
];

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
  const [isStatusMenuOpen, setIsStatusMenuOpen] = React.useState(false);
  const [roomIdFilter, setRoomIdFilter] = React.useState('');
  const [emailFilter, setEmailFilter] = React.useState('');
  const statusMenuRef = React.useRef<HTMLDivElement | null>(null);
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

  React.useEffect(() => {
    if (!isStatusMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !statusMenuRef.current?.contains(target)) {
        setIsStatusMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsStatusMenuOpen(false);
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isStatusMenuOpen]);

  const selectedStatusLabel = STATUS_OPTIONS.find((option) => option.value === statusFilter)?.label ?? 'Все статусы';

  return (
    <motion.div
      data-cursor-scope="admin"
      className="pointer-events-auto absolute inset-0 z-overlay flex items-start justify-center overflow-y-auto p-2 pb-28 pt-6 sm:p-4 sm:pb-32 sm:pt-8"
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
            data-cursor="view"
            data-cursor-text="BACK"
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
                <button
                  type="button"
                  className="ml-2 underline"
                  data-cursor="admin"
                  data-cursor-text="RETRY"
                  onClick={() => void usersQuery.refetch()}
                >
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
                        data-cursor={updateRole.isPending ? 'locked' : 'admin'}
                        data-cursor-text={updateRole.isPending ? undefined : 'ROLE'}
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
              <div ref={statusMenuRef} className="relative">
                <button
                  type="button"
                  data-cursor="admin"
                  data-cursor-text="STATUS"
                  aria-haspopup="listbox"
                  aria-expanded={isStatusMenuOpen}
                  className="flex w-full items-center justify-between gap-2 rounded-full border border-white/22 bg-background/45 px-3 py-2 text-xs text-foreground transition hover:border-white/35 hover:bg-background/60"
                  onClick={() => setIsStatusMenuOpen((open) => !open)}
                >
                  <span className="truncate">{selectedStatusLabel}</span>
                  <ChevronDown size={14} className={isStatusMenuOpen ? 'rotate-180 transition-transform' : 'transition-transform'} />
                </button>

                <AnimatePresence>
                  {isStatusMenuOpen && (
                    <motion.div
                      role="listbox"
                      initial={reducedMotion ? false : {opacity: 0, y: -6, scale: 0.98}}
                      animate={reducedMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
                      exit={reducedMotion ? undefined : {opacity: 0, y: -4, scale: 0.98}}
                      transition={{duration: 0.16}}
                      className="absolute right-0 z-dockMenu mt-2 w-full min-w-[190px] overflow-hidden rounded-2xl border border-white/20 bg-[linear-gradient(150deg,hsl(var(--surface-glass-1)),hsl(var(--surface-glass-2)))] shadow-glow backdrop-blur-2xl"
                    >
                      <div className="max-h-56 overflow-y-auto p-1 rf-scrollbar">
                        {STATUS_OPTIONS.map((option) => {
                          const isActive = option.value === statusFilter;
                          return (
                            <button
                              key={option.label}
                              type="button"
                              role="option"
                              aria-selected={isActive}
                              data-cursor="admin"
                              data-cursor-text={isActive ? 'ACTIVE' : 'STATUS'}
                              onClick={() => {
                                setStatusFilter(option.value);
                                setIsStatusMenuOpen(false);
                              }}
                              className={`relative flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs transition ${
                                isActive
                                  ? 'bg-primary/28 text-foreground'
                                  : 'text-muted-foreground hover:bg-white/10 hover:text-foreground'
                              }`}
                            >
                              <span>{option.label}</span>
                              {isActive && <Check size={13} className="text-primary" />}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {adminBookingsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Загрузка бронирований...</p>
            ) : adminBookingsQuery.isError ? (
              <div className="text-sm text-danger">
                Не удалось загрузить бронирования.
                <button
                  type="button"
                  className="ml-2 underline"
                  data-cursor="admin"
                  data-cursor-text="RETRY"
                  onClick={() => void adminBookingsQuery.refetch()}
                >
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
                        data-cursor={cancelAdminBookingMutation.isPending ? 'locked' : 'danger'}
                        data-cursor-text={cancelAdminBookingMutation.isPending ? undefined : 'CANCEL'}
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
