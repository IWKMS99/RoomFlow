import {useMemo, useState} from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
import {useHubStore} from '../../../store/useHubStore';
import {useAuth} from '../../../context/useAuth';
import {normalizeDate, formatDateForApi} from '../../../lib/datetime/dateKey';
import {useMyBookingsQuery} from '../../../services/hooks/useMyBookingsQuery';
import {useCancelBookingMutation} from '../../../services/hooks/useCancelBookingMutation';
import MagneticButton from '../../../components/motion/MagneticButton';
import {getApiErrorMessage} from '../../../lib/httpError';
import {motionPreset} from '../../../lib/motion';
import {motionTokens} from '../../../lib/motionTokens';
import PillToggle from '../../../components/ui/PillToggle';
import StatusChip from '../../../components/ui/StatusChip';
import type {BookingResponse, BookingStatus} from '../../../types/booking';

type BookingTab = 'active' | 'history';

const ACTIVE_STATUSES: BookingStatus[] = ['REQUESTED', 'CONFIRMED'];

const statusLabelMap: Record<BookingStatus, string> = {
  REQUESTED: 'В обработке',
  CONFIRMED: 'Подтверждено',
  COMPLETED: 'Завершено',
  CANCELLED: 'Отменено',
};

const statusToneMap: Record<BookingStatus, 'warning' | 'active' | 'muted' | 'danger'> = {
  REQUESTED: 'warning',
  CONFIRMED: 'active',
  COMPLETED: 'muted',
  CANCELLED: 'danger',
};

const sortByStartAsc = (left: BookingResponse, right: BookingResponse) =>
  new Date(left.startTime).getTime() - new Date(right.startTime).getTime();

const sortByStartDesc = (left: BookingResponse, right: BookingResponse) =>
  new Date(right.startTime).getTime() - new Date(left.startTime).getTime();

const MyBookingsOverlay = () => {
  const {i18n} = useTranslation();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const {isAuthenticated} = useAuth();
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const cameraPose = useHubStore((state) => state.cameraPose);
  const bookingsQuery = useMyBookingsQuery(isAuthenticated);
  const cancelMutation = useCancelBookingMutation(selectedDateKey);
  const [activeTab, setActiveTab] = useState<BookingTab>('active');
  const nowTs = Date.now();
  const bookings = useMemo(() => bookingsQuery.data ?? [], [bookingsQuery.data]);

  const activeBookings = useMemo(
    () =>
      bookings
        .filter((booking) => ACTIVE_STATUSES.includes(booking.status) && new Date(booking.endTime).getTime() >= nowTs)
        .sort(sortByStartAsc),
    [bookings, nowTs]
  );
  const historyBookings = useMemo(
    () =>
      bookings
        .filter((booking) => !ACTIVE_STATUSES.includes(booking.status) || new Date(booking.endTime).getTime() < nowTs)
        .sort(sortByStartDesc),
    [bookings, nowTs]
  );
  const visibleBookings = activeTab === 'active' ? activeBookings : historyBookings;

  if (!isAuthenticated) {
    return null;
  }

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelMutation.mutateAsync(bookingId);
      toast.success('Бронирование отменено.');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Не удалось отменить бронирование.'));
    }
  };

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-40 flex items-start justify-center overflow-y-auto p-2 pb-28 pt-6 sm:p-4 sm:pb-32 sm:pt-8"
      initial={reducedMotion ? false : {opacity: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, x: cameraPose === 'bookings' ? 0 : 16}}
      exit={reducedMotion ? undefined : {opacity: 0}}
      transition={motionTokens.overlay}
    >
      <motion.div
        layoutId="my-bookings-panel"
        transition={motionTokens.card}
        className="rf-modal flex max-h-[calc(100dvh-8.5rem)] w-full max-w-5xl flex-col rounded-3xl p-4 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="m-0 text-2xl font-bold text-foreground">Мои бронирования</h2>
          <MagneticButton
            onClick={() => {
              useHubStore.getState().closeBookings();
              navigate('/schedule');
            }}
            className="rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-foreground"
          >
            Закрыть
          </MagneticButton>
        </div>

        <div className="min-h-0 overflow-y-auto pr-1 rf-scrollbar">
          {bookingsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Загрузка бронирований...</p>
          ) : bookingsQuery.isError ? (
            <div className="text-sm text-danger">
              Не удалось загрузить бронирования.
              <button type="button" className="ml-2 underline" onClick={() => void bookingsQuery.refetch()}>
                Повторить
              </button>
            </div>
          ) : bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">Пока нет активных или исторических бронирований.</p>
          ) : (
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <PillToggle active={activeTab === 'active'} groupId="my-bookings-tab" itemId="active" onClick={() => setActiveTab('active')}>
                  Активные ({activeBookings.length})
                </PillToggle>
                <PillToggle active={activeTab === 'history'} groupId="my-bookings-tab" itemId="history" onClick={() => setActiveTab('history')}>
                  Прошедшие/отменённые ({historyBookings.length})
                </PillToggle>
              </div>

              {visibleBookings.length === 0 ? (
                <p className="pb-2 text-sm text-muted-foreground">
                  {activeTab === 'active' ? 'Сейчас нет активных бронирований.' : 'Нет прошедших или отменённых бронирований.'}
                </p>
              ) : (
                <div className="grid gap-3 pb-1 md:grid-cols-2">
                  {visibleBookings.map((booking, idx) => {
                    const canCancel = booking.status === 'CONFIRMED' && new Date(booking.startTime).getTime() > nowTs;
                    return (
                      <motion.article
                        key={booking.id}
                        layoutId={`booking-card-${booking.id}`}
                        initial={reducedMotion ? false : {opacity: 0, y: 8}}
                        animate={reducedMotion ? undefined : {opacity: 1, y: 0}}
                        transition={reducedMotion ? motionPreset.quick : {delay: idx * 0.03, ...motionTokens.fade}}
                        className="rounded-2xl border border-white/16 bg-card/70 p-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <p className="m-0 text-lg font-semibold text-foreground">{booking.roomName}</p>
                          <StatusChip tone={statusToneMap[booking.status]} label={statusLabelMap[booking.status]} />
                        </div>
                        <p className="m-0 mt-1 text-sm text-muted-foreground">
                          {new Date(booking.startTime).toLocaleDateString(locale)} •{' '}
                          {new Date(booking.startTime).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})}
                          {' - '}
                          {new Date(booking.endTime).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'})}
                        </p>

                        {canCancel && (
                          <MagneticButton
                            onClick={() => void handleCancel(booking.id)}
                            disabled={cancelMutation.isPending}
                            className="mt-3 rounded-lg border border-danger/45 bg-danger/20 px-3 py-1.5 text-xs font-semibold text-danger"
                          >
                            {cancelMutation.isPending ? 'Отмена...' : 'Отменить'}
                          </MagneticButton>
                        )}
                      </motion.article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MyBookingsOverlay;
