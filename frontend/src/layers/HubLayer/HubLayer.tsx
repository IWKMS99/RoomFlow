import React from 'react';
import {motion} from 'framer-motion';
import {useNavigate} from '@tanstack/react-router';
import {useTranslation} from 'react-i18next';
import {Users, Layers, ImageIcon} from 'lucide-react';
import {formatDateForApi, normalizeDate, parseDateKey} from '../../lib/datetime/dateKey';
import {useHubStore} from '../../store/useHubStore';
import {useScheduleQuery} from '../../services/hooks/useScheduleQuery';
import type {ScheduleRoomVm} from '../../features/schedule/lib/scheduleViewModel';
import {motionTokens} from '../../lib/motionTokens';
import DateNavigator from '../../features/schedule/components/DateNavigator';
import SeoMeta from '../../components/seo/SeoMeta';
import {absoluteUrl} from '../../lib/seo';

interface RoomSummary extends Omit<ScheduleRoomVm, 'isPast' | 'isAvailable'> {
  availableSlots: number;
}

const HubLayer = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const setSelectedDateKey = useHubStore((state) => state.setSelectedDateKey);
  const selectedDate = parseDateKey(selectedDateKey);

  React.useEffect(() => {
    if (!useHubStore.getState().selectedDateKey) {
      setSelectedDateKey(selectedDateKey);
    }
  }, [selectedDateKey, setSelectedDateKey]);

  const {model, isLoading} = useScheduleQuery(selectedDate);

  const rooms = React.useMemo<RoomSummary[]>(() => {
    const roomMap = new Map<string, RoomSummary>();

    model.slots.forEach((slot) => {
      slot.rooms.forEach((room) => {
        if (!roomMap.has(room.roomId)) {
          roomMap.set(room.roomId, {
            roomId: room.roomId,
            roomName: room.roomName,
            floor: room.floor,
            capacity: room.capacity,
            coverImageUrl: room.coverImageUrl, // Исправление здесь!
            availableSlots: 0,
          });
        }

        if (room.isAvailable && !room.isPast) {
          const next = roomMap.get(room.roomId);
          if (next) {
            next.availableSlots += 1;
          }
        }
      });
    });

    return Array.from(roomMap.values());
  }, [model]);
  const lastNonEmptyRoomsRef = React.useRef<RoomSummary[]>([]);

  React.useEffect(() => {
    if (rooms.length > 0) {
      lastNonEmptyRoomsRef.current = rooms;
    }
  }, [rooms]);

  const visibleRooms = rooms.length > 0 ? rooms : lastNonEmptyRoomsRef.current;
  const isInitialLoading = isLoading && visibleRooms.length === 0;
  const [brokenImageRooms, setBrokenImageRooms] = React.useState<Record<string, boolean>>({});

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-12">
      <SeoMeta
        title="Бронирование переговорных комнат | RoomFlow"
        description="Актуальное расписание переговорных комнат и быстрый выбор свободных слотов."
        url={absoluteUrl('/schedule')}
      />
      <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t('hub.title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('hub.subtitle')}</p>
        </div>

        <DateNavigator selectedDate={selectedDate} onSelect={(date) => setSelectedDateKey(formatDateForApi(date))} />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isInitialLoading && <div className="text-foreground">{t('hub.loading')}</div>}

        {!isInitialLoading && visibleRooms.map((room) => (
          <motion.div
            key={room.roomId}
            layoutId={`room-card-${room.roomId}`}
            layout="position"
            transition={{type: 'spring', stiffness: 280, damping: 24}}
            style={{borderRadius: 32}}
            data-room-id={room.roomId}
            onClick={() => {
              useHubStore.getState().enterRoom(room.roomId);
              navigate({to: '/schedule/room/$roomId', params: {roomId: room.roomId}});
            }}
            whileHover={{y: -4}}
            whileTap={{scale: 0.985}}
            className="group relative flex cursor-pointer flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-card/40 p-2 shadow-soft backdrop-blur-3xl transition-colors hover:border-primary/30 hover:bg-card/60"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-white/5">
              {room.coverImageUrl && !brokenImageRooms[room.roomId] ? (
                <motion.img
                  src={room.coverImageUrl}
                  alt={`${room.roomName} ${t('room.imageAlt')}`}
                  loading="lazy"
                  decoding="async"
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{duration: 0.22, ease: 'easeOut'}}
                  onError={() => setBrokenImageRooms((state) => ({...state, [room.roomId]: true}))}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground opacity-50">
                  <ImageIcon size={32} className="mb-2" />
                  <span className="text-xs">{t('room.imageUnavailable')}</span>
                </div>
              )}
              
              <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-background/70 px-2.5 py-1 text-[11px] font-semibold text-foreground backdrop-blur-md shadow-lg">
                {room.availableSlots > 0 ? (
                  <>
                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    {t('schedule.status.free')}
                  </>
                ) : (
                  <>
                    <span className="flex h-2 w-2 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                    {t('schedule.status.busy')}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-1 flex-col justify-between px-3 pb-3 pt-4">
              <div>
                <motion.h3
                  layoutId={`room-title-${room.roomId}`}
                  transition={motionTokens.card}
                  className="text-xl font-bold text-foreground transition-colors group-hover:text-primary"
                >
                  {room.roomName}
                </motion.h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {room.availableSlots > 0 ? (
                    <span className="font-medium text-emerald-400/90">{room.availableSlots} слотов доступно</span>
                  ) : (
                    <span className="font-medium text-red-400/90">Нет свободных слотов</span>
                  )}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-white/10">
                  <Users size={14} className="text-primary/70" /> {room.capacity}
                </span>
                <span className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors group-hover:bg-white/10">
                  <Layers size={14} className="text-primary/70" /> {room.floor} этаж
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HubLayer;
