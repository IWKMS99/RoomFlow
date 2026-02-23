import React from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowLeft, User} from 'lucide-react';
import {useNavigate, useParams} from 'react-router-dom';
import toast from 'react-hot-toast';
import GlassCard from '../../../components/polish/GlassCard';
import EmptyState from '../../../components/polish/EmptyState';
import ScheduleTimelineDesktop from '../../../features/schedule/components/ScheduleTimelineDesktop';
import ScheduleListMobile from '../../../features/schedule/components/ScheduleListMobile';
import type {DirectSelectionRange} from '../../../features/schedule/hooks/useDirectBookingSelection';
import {formatLocalDateTime} from '../../../lib/datetime/formatLocalDateTime';
import {parseDateKey, normalizeDate, formatDateForApi} from '../../../lib/datetime/dateKey';
import {useHubStore} from '../../../store/useHubStore';
import {useScheduleQuery} from '../../../services/hooks/useScheduleQuery';
import {useCreateBookingMutation} from '../../../services/hooks/useCreateBookingMutation';
import {useMediaQuery} from '../../../hooks/useMediaQuery';
import MagneticButton from '../../../components/motion/MagneticButton';
import {getApiErrorMessage} from '../../../lib/httpError';
import {motionTokens} from '../../../lib/motionTokens';

const RoomDetailOverlay = () => {
  const navigate = useNavigate();
  const params = useParams();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const activeRoomId = useHubStore((state) => state.activeRoomId);
  const cameraPose = useHubStore((state) => state.cameraPose);
  const reducedMotion = useReducedMotion();
  const guardToastRef = React.useRef(false);

  const schedule = useScheduleQuery(parseDateKey(selectedDateKey));
  const [selectedRange, setSelectedRange] = React.useState<DirectSelectionRange | null>(null);
  const [nowTs, setNowTs] = React.useState(Date.now());

  const roomId = activeRoomId ?? params.roomId ?? null;

  const roomModel = React.useMemo(() => {
    if (!roomId) {
      return {slots: []};
    }

    return {
      slots: schedule.model.slots
        .map((slot) => ({...slot, rooms: slot.rooms.filter((room) => room.roomId === roomId)}))
        .filter((slot) => slot.rooms.length > 0),
    };
  }, [roomId, schedule.model.slots]);

  const roomMeta = React.useMemo(() => {
    const firstRoom = roomModel.slots[0]?.rooms[0];
    if (!firstRoom) {
      return null;
    }
    return {
      roomName: firstRoom.roomName,
      floor: firstRoom.floor,
      capacity: firstRoom.capacity,
    };
  }, [roomModel.slots]);

  React.useEffect(() => {
    if (roomId && activeRoomId !== roomId) {
      useHubStore.getState().enterRoom(roomId);
    }
  }, [activeRoomId, roomId]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    if (!roomId || schedule.isLoading || schedule.isError) {
      return;
    }

    if (roomModel.slots.length > 0) {
      guardToastRef.current = false;
      return;
    }

    if (!guardToastRef.current) {
      toast('Комната не найдена в расписании на выбранную дату. Возвращаем в хаб.');
      guardToastRef.current = true;
    }

    useHubStore.getState().exitRoom();
    navigate('/schedule', {replace: true});
  }, [navigate, roomId, roomModel.slots.length, schedule.isError, schedule.isLoading]);

  const createMutation = useCreateBookingMutation(selectedDateKey, roomId ?? '');

  const handleBook = async () => {
    if (!selectedRange || !roomId) {
      return;
    }

    try {
      await createMutation.mutateAsync({
        roomId,
        startTime: formatLocalDateTime(parseDateKey(selectedDateKey), selectedRange.start),
        endTime: formatLocalDateTime(parseDateKey(selectedDateKey), selectedRange.end),
      });
      toast.success('Бронирование создано.');
      setSelectedRange(null);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Не удалось завершить бронирование.'));
    }
  };

  if (!roomId) return null;

  const closeRoomDetail = () => {
    useHubStore.getState().exitRoom();
    navigate('/schedule');
  };

  return (
    <motion.div
      key="room-detail-overlay"
      className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4"
      initial={reducedMotion ? false : {opacity: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, scale: cameraPose === 'room' ? 1 : 0.98}}
      exit={reducedMotion ? undefined : {opacity: 0}}
      transition={motionTokens.overlay}
      onClick={closeRoomDetail}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <motion.div
        layoutId={`room-card-${roomId}`}
        transition={{type: 'spring', stiffness: 280, damping: 24}}
        className="rf-modal relative w-full max-w-6xl overflow-hidden rounded-3xl p-4 sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          animate={reducedMotion ? undefined : 'visible'}
          variants={{visible: {transition: {staggerChildren: 0.1}}, hidden: {}}}
          className="grid gap-4"
        >
          <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}} className="mb-1 flex items-start justify-between gap-3">
            <div>
              <p className="rf-meta m-0 text-[11px] text-muted-foreground">Room Detail</p>
              <motion.h2 layoutId={`room-title-${roomId}`} transition={motionTokens.card} className="m-0 mt-1 text-2xl font-bold text-foreground">
                {roomMeta?.roomName ?? 'Комната'}
              </motion.h2>
              {roomMeta && (
                <p className="rf-tabular m-0 mt-1 text-sm text-muted-foreground">
                  {roomMeta.capacity} мест • Этаж {roomMeta.floor}
                </p>
              )}
            </div>

            <MagneticButton
              onClick={closeRoomDetail}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-foreground"
            >
              <ArrowLeft size={15} /> Назад
            </MagneticButton>
          </motion.div>

          {schedule.isLoading ? (
            <p className="text-sm text-muted-foreground">Загружаем таймлайн комнаты...</p>
          ) : schedule.isError ? (
            <div className="rounded-xl border border-danger/45 bg-danger/10 px-4 py-3 text-sm text-danger">
              Не удалось загрузить таймлайн.
              <button type="button" className="ml-3 underline" onClick={() => void schedule.refetch()}>
                Повторить
              </button>
            </div>
          ) : roomModel.slots.length === 0 ? (
            <EmptyState title="Нет данных по комнате" description="Выберите другую дату или обновите страницу." icon={User} />
          ) : (
            <motion.div
              initial={reducedMotion ? false : 'hidden'}
              animate={reducedMotion ? undefined : 'visible'}
              variants={{visible: {transition: {staggerChildren: 0.1}}, hidden: {}}}
              className="grid gap-4"
            >
              <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}}>
                <p className="mb-2 mt-0 text-xs text-muted-foreground">
                  Обновлено: {Math.max(0, Math.floor((nowTs - schedule.dataUpdatedAt) / 1000))} сек назад
                </p>
                {isDesktop ? (
                  <ScheduleTimelineDesktop
                    compact
                    model={roomModel}
                    selectedRange={selectedRange}
                    onSelectionCommit={(range) => setSelectedRange(range)}
                    onSelectionClear={() => setSelectedRange(null)}
                  />
                ) : (
                  <ScheduleListMobile
                    model={roomModel}
                    selectedRange={selectedRange}
                    onSelectionCommit={(range) => setSelectedRange(range)}
                    onSelectionClear={() => setSelectedRange(null)}
                  />
                )}
              </motion.div>

              <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}}>
                <GlassCard variant="compact" className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="rf-tabular m-0 text-sm font-semibold text-foreground">
                      {selectedRange ? `${selectedRange.start} - ${selectedRange.end}` : 'Выберите диапазон'}
                    </p>
                    <p className="rf-tabular m-0 mt-1 text-xs text-muted-foreground">
                      {selectedRange ? `Слотов: ${selectedRange.slotCount}` : 'Выделите интервалы на таймлайне'}
                    </p>
                  </div>
                  <MagneticButton
                    onClick={() => void handleBook()}
                    disabled={!selectedRange || createMutation.isPending}
                    className="rounded-xl border border-primary/50 bg-primary/75 px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createMutation.isPending ? 'Бронируем...' : 'Забронировать'}
                  </MagneticButton>
                </GlassCard>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default RoomDetailOverlay;
