import React from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {ArrowLeft, User} from 'lucide-react';
import {useNavigate, useParams} from '@tanstack/react-router';
import toast from 'react-hot-toast';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation();
  const navigate = useNavigate();
  const params = useParams({strict: false});
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const activeRoomId = useHubStore((state) => state.activeRoomId);
  const cameraPose = useHubStore((state) => state.cameraPose);
  const reducedMotion = useReducedMotion();
  const guardToastRef = React.useRef(false);

  const currentRoomId = activeRoomId ?? params.roomId ?? null;
  const lastRoomIdRef = React.useRef(currentRoomId);
  if (currentRoomId) {
    lastRoomIdRef.current = currentRoomId;
  }
  const roomId = currentRoomId ?? lastRoomIdRef.current;

  const schedule = useScheduleQuery(parseDateKey(selectedDateKey));
  const [selectedRange, setSelectedRange] = React.useState<DirectSelectionRange | null>(null);
  const [nowTs, setNowTs] = React.useState(Date.now());

  const roomModel = React.useMemo(() => {
    if (!roomId) return {slots: []};

    return {
      slots: schedule.model.slots
        .map((slot) => ({...slot, rooms: slot.rooms.filter((room) => room.roomId === roomId)}))
        .filter((slot) => slot.rooms.length > 0),
    };
  }, [roomId, schedule.model.slots]);

  const roomMeta = React.useMemo(() => {
    const firstRoom = roomModel.slots[0]?.rooms[0];
    if (!firstRoom) return null;
    return {
      roomName: firstRoom.roomName,
      floor: firstRoom.floor,
      capacity: firstRoom.capacity,
      coverImageUrl: firstRoom.coverImageUrl ?? null,
    };
  }, [roomModel.slots]);
  const [imageError, setImageError] = React.useState(false);

  const updatedSecondsAgo = Math.max(0, Math.floor((nowTs - schedule.dataUpdatedAt) / 1000));

  React.useEffect(() => {
    if (currentRoomId && activeRoomId !== currentRoomId) {
      useHubStore.getState().enterRoom(currentRoomId);
    }
  }, [activeRoomId, currentRoomId]);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(() => {
    setImageError(false);
  }, [roomId, selectedDateKey, roomMeta?.coverImageUrl]);

  React.useEffect(() => {
    if (!currentRoomId || schedule.isLoading || schedule.isError) {
      return;
    }

    if (roomModel.slots.length > 0) {
      guardToastRef.current = false;
      return;
    }

    if (!guardToastRef.current) {
      toast(t('roomDetail.roomNotFound'));
      guardToastRef.current = true;
    }

    useHubStore.getState().exitRoom();
    navigate({to: '/schedule', replace: true});
  }, [navigate, currentRoomId, roomModel.slots.length, schedule.isError, schedule.isLoading, t]);

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
      toast.success(t('roomDetail.bookingCreated'));
      setSelectedRange(null);
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, t('roomDetail.bookingError')));
    }
  };

  if (!roomId) return null;

  const closeRoomDetail = () => {
    navigate({to: '/schedule'});
  };

  return (
    <motion.div
      key="room-detail-overlay"
      data-cursor-scope="book"
      className="pointer-events-auto absolute inset-0 z-overlay flex items-start justify-center overflow-y-auto p-2 pb-28 pt-6 sm:p-4 sm:pb-32 sm:pt-8"
      initial={reducedMotion ? false : {opacity: 0}}
      animate={reducedMotion ? undefined : {opacity: 1, scale: cameraPose === 'room' ? 1 : 0.98}}
      exit={reducedMotion ? undefined : {opacity: 0}}
      transition={motionTokens.overlay}
      onClick={closeRoomDetail}
    >
      {/* Локальный backdrop удален, так как Layout.tsx теперь предоставляет глобальный */}
      <motion.div
        layoutId={`room-card-${roomId}`}
        transition={{type: 'spring', stiffness: 280, damping: 24}}
        className="rf-modal relative flex max-h-[calc(100dvh-8.5rem)] w-full max-w-6xl flex-col overflow-y-auto overflow-x-hidden rounded-3xl p-3 sm:p-5 lg:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <motion.div
          initial={reducedMotion ? false : 'hidden'}
          animate={reducedMotion ? undefined : 'visible'}
          variants={{visible: {transition: {staggerChildren: 0.1}}, hidden: {}}}
          className="grid gap-4"
        >
          {roomMeta?.coverImageUrl && !imageError ? (
            <motion.div
              variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}}
              className="relative overflow-hidden rounded-2xl border border-white/12 bg-background/30"
            >
              <img
                src={roomMeta.coverImageUrl}
                alt={`${roomMeta.roomName} ${t('room.imageAlt')}`}
                loading="lazy"
                decoding="async"
                onError={() => setImageError(true)}
                className="h-full w-full aspect-[21/9] object-cover"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
            </motion.div>
          ) : (
            <motion.div
              variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}}
              className="flex aspect-[21/9] items-center justify-center rounded-2xl border border-white/12 bg-background/25 text-sm text-muted-foreground"
            >
              {t('room.imageUnavailable')}
            </motion.div>
          )}

          <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}} className="mb-1 flex flex-col gap-3 rounded-2xl border border-white/10 bg-background/35 p-3 sm:p-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="rf-meta m-0 text-[11px] text-muted-foreground">{t('roomDetail.detailsLabel')}</p>
              <motion.h2 layoutId={`room-title-${roomId}`} transition={motionTokens.card} className="m-0 mt-1 truncate text-xl font-bold text-foreground sm:text-2xl">
                {roomMeta?.roomName ?? t('roomDetail.fallbackRoomName')}
              </motion.h2>
              {roomMeta && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="rf-tabular rounded-lg border border-white/15 bg-background/45 px-2 py-1 text-xs text-muted-foreground">
                    {t('roomDetail.capacity', {count: roomMeta.capacity})}
                  </span>
                  <span className="rf-tabular rounded-lg border border-white/15 bg-background/45 px-2 py-1 text-xs text-muted-foreground">
                    {t('roomDetail.floor', {floor: roomMeta.floor})}
                  </span>
                  <span className="rf-tabular rounded-lg border border-white/15 bg-background/45 px-2 py-1 text-xs text-muted-foreground">
                    {selectedDateKey}
                  </span>
                </div>
              )}
            </div>

            <MagneticButton
              onClick={closeRoomDetail}
              data-cursor="view"
              data-cursor-text={t('cursor.back')}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm font-semibold text-foreground sm:w-auto"
            >
              <ArrowLeft size={15} /> {t('common.back')}
            </MagneticButton>
          </motion.div>

          {schedule.isLoading ? (
            <div className="rounded-2xl border border-white/12 bg-background/25 px-4 py-5 text-sm text-muted-foreground">
              {t('roomDetail.loadingSchedule')}
            </div>
          ) : schedule.isError ? (
            <div className="rounded-xl border border-danger/45 bg-danger/10 px-4 py-3 text-sm text-danger">
              {t('roomDetail.errorSchedule')}
              <button
                type="button"
                className="ml-3 underline"
                data-cursor="book"
                data-cursor-text={t('cursor.retry')}
                onClick={() => void schedule.refetch()}
              >
                {t('common.retry')}
              </button>
            </div>
          ) : roomModel.slots.length === 0 ? (
            <EmptyState title={t('roomDetail.emptyTitle')} description={t('roomDetail.emptyDescription')} icon={User} />
          ) : (
            <motion.div
              initial={reducedMotion ? false : 'hidden'}
              animate={reducedMotion ? undefined : 'visible'}
              variants={{visible: {transition: {staggerChildren: 0.1}}, hidden: {}}}
              className="grid min-h-0 gap-4"
            >
              <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}} className="rounded-2xl border border-white/12 bg-background/20 p-3 sm:p-4">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-white/15 bg-background/45 px-2.5 py-1 text-xs text-muted-foreground">
                    {t('roomDetail.updatedAgo', {seconds: updatedSecondsAgo})}
                  </span>
                  <span className="rounded-lg border border-primary/35 bg-primary/10 px-2.5 py-1 text-xs text-primary">
                    {isDesktop ? t('roomDetail.desktopHint') : t('roomDetail.mobileHint')}
                  </span>
                </div>
                <div className="min-h-0 max-h-[38dvh] overflow-y-auto overflow-x-hidden pr-1 rf-scrollbar sm:max-h-[54dvh] lg:max-h-[58dvh]">
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
                </div>
              </motion.div>

              <motion.div variants={{hidden: {opacity: 0, y: 10}, visible: {opacity: 1, y: 0}}}>
                <GlassCard variant="compact" className="flex flex-col gap-3 rounded-2xl border border-white/12 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="rf-tabular m-0 mb-2 text-sm font-semibold text-foreground">
                      {selectedRange ? `${selectedRange.start} - ${selectedRange.end}` : t('roomDetail.selectRange')}
                    </p>
                  </div>
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedRange(null)}
                      data-cursor={!selectedRange || createMutation.isPending ? 'locked' : 'view'}
                      data-cursor-text={!selectedRange || createMutation.isPending ? undefined : t('cursor.clear')}
                      disabled={!selectedRange || createMutation.isPending}
                      className="w-1/2 rounded-xl border border-white/20 bg-white/8 px-3 py-2 text-sm font-medium text-foreground disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {t('common.reset')}
                    </button>
                    <MagneticButton
                      onClick={() => void handleBook()}
                      data-cursor={!selectedRange || createMutation.isPending ? 'locked' : 'book'}
                      data-cursor-text={!selectedRange || createMutation.isPending ? undefined : t('cursor.book')}
                      disabled={!selectedRange || createMutation.isPending}
                      className="w-1/2 rounded-xl border border-primary/50 bg-primary/75 px-4 py-2 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                      {createMutation.isPending ? t('roomDetail.bookingPending') : t('roomDetail.book')}
                    </MagneticButton>
                  </div>
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
