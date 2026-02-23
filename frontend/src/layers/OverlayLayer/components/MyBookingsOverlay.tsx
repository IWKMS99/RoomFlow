import {motion, useReducedMotion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import toast from 'react-hot-toast';
import {useHubStore} from '../../../store/useHubStore';
import {useAuth} from '../../../context/useAuth';
import {normalizeDate, formatDateForApi} from '../../../lib/datetime/dateKey';
import {useMyBookingsQuery} from '../../../services/hooks/useMyBookingsQuery';
import {useCancelBookingMutation} from '../../../services/hooks/useCancelBookingMutation';
import MagneticButton from '../../../components/motion/MagneticButton';
import {getApiErrorMessage} from '../../../lib/httpError';
import {motionPreset} from '../../../lib/motion';
import {motionTokens} from '../../../lib/motionTokens';

const MyBookingsOverlay = () => {
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();
  const {isAuthenticated} = useAuth();
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const cameraPose = useHubStore((state) => state.cameraPose);
  const bookingsQuery = useMyBookingsQuery(isAuthenticated);
  const cancelMutation = useCancelBookingMutation(selectedDateKey);

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
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4"
      initial={reducedMotion ? false : {opacity: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, x: cameraPose === 'bookings' ? 0 : 16}}
      exit={reducedMotion ? undefined : {opacity: 0}}
      transition={motionTokens.overlay}
    >
      <motion.div layoutId="my-bookings-panel" transition={motionTokens.card} className="rf-modal w-full max-w-5xl rounded-3xl p-4 sm:p-6">
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

        {bookingsQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Загрузка бронирований...</p>
        ) : bookingsQuery.isError ? (
          <div className="text-sm text-danger">
            Не удалось загрузить бронирования.
            <button type="button" className="ml-2 underline" onClick={() => void bookingsQuery.refetch()}>
              Повторить
            </button>
          </div>
        ) : (bookingsQuery.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">Пока нет активных или исторических бронирований.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {(bookingsQuery.data ?? []).map((booking, idx) => {
              const canCancel = booking.status === 'CONFIRMED' && new Date(booking.startTime).getTime() > Date.now();
              return (
                <motion.article
                  key={booking.id}
                  layoutId={`booking-card-${booking.id}`}
                  initial={reducedMotion ? false : {opacity: 0, y: 8}}
                  animate={reducedMotion ? undefined : {opacity: 1, y: 0}}
                  transition={reducedMotion ? motionPreset.quick : {delay: idx * 0.03, ...motionTokens.fade}}
                  className="rounded-2xl border border-white/16 bg-card/70 p-4"
                >
                  <p className="m-0 text-lg font-semibold text-foreground">{booking.roomName}</p>
                  <p className="m-0 mt-1 text-sm text-muted-foreground">
                    {new Date(booking.startTime).toLocaleDateString('ru-RU')} •{' '}
                    {new Date(booking.startTime).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
                  </p>
                  <p className="m-0 mt-2 text-xs text-muted-foreground">Статус: {booking.status}</p>

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
      </motion.div>
    </motion.div>
  );
};

export default MyBookingsOverlay;
