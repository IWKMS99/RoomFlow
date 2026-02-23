import React from 'react';
import {motion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import {DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {useTranslation} from 'react-i18next';
import {formatDateForApi, formatDateForDisplay, normalizeDate, parseDateKey} from '../../lib/datetime/dateKey';
import {useHubStore} from '../../store/useHubStore';
import {useScheduleQuery} from '../../services/hooks/useScheduleQuery';
import type {ScheduleRoomVm} from '../../features/schedule/lib/scheduleViewModel';
import {motionTokens} from '../../lib/motionTokens';

interface RoomSummary extends Omit<ScheduleRoomVm, 'isPast' | 'isAvailable'> {
  availableSlots: number;
}

const HubLayer = () => {
  const {t, i18n} = useTranslation();
  const navigate = useNavigate();
  const selectedDateKey = useHubStore((state) => state.selectedDateKey) || formatDateForApi(normalizeDate(new Date()));
  const setSelectedDateKey = useHubStore((state) => state.setSelectedDateKey);
  const selectedDate = parseDateKey(selectedDateKey);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

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

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-12">
      <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">{t('hub.title')}</h1>
          <p className="mt-2 text-lg text-muted-foreground">{t('hub.subtitle')}</p>
        </div>

        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCalendarOpen((current) => !current)}
            className="rounded-lg border border-white/14 bg-background/40 px-4 py-2 text-sm font-medium text-foreground shadow-sm backdrop-blur-md transition hover:bg-background/56"
          >
            {formatDateForDisplay(selectedDate, i18n.language === 'ru' ? 'ru-RU' : 'en-US')}
          </button>

          {calendarOpen && (
            <div className="absolute right-0 top-12 z-popover rounded-xl border border-white/14 bg-card/95 p-3 shadow-2xl backdrop-blur-md">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  setSelectedDateKey(formatDateForApi(normalizeDate(date)));
                  setCalendarOpen(false);
                }}
                disabled={{before: normalizeDate(new Date())}}
                className="text-foreground"
              />
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isInitialLoading && <div className="text-foreground">{t('hub.loading')}</div>}

        {!isInitialLoading && visibleRooms.map((room) => (
          <motion.div
            key={room.roomId}
            layoutId={`room-card-${room.roomId}`}
            transition={{type: 'spring', stiffness: 280, damping: 24}}
            data-room-id={room.roomId}
            onClick={() => {
              useHubStore.getState().enterRoom(room.roomId);
              navigate(`/schedule/room/${room.roomId}`);
            }}
            whileHover={{y: -4}}
            whileTap={{scale: 0.995}}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-card/38 p-6 shadow-[inset_0_1px_0_hsl(var(--text-hi)/0.12),0_22px_54px_-34px_hsl(var(--shadow-depth)/0.94)] backdrop-blur-[20px] transition-colors hover:border-primary/40 hover:bg-card/56"
          >
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_1px_20px_hsl(var(--glow-2)/0.1)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="mb-4 flex items-start justify-between">
              <div className="rf-tabular rounded-full border border-white/10 bg-background/24 px-3 py-1 text-xs font-medium text-muted-foreground">
                {room.floor} этаж
              </div>
              {room.availableSlots > 0 ? (
                <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_10px_3px_rgba(16,185,129,0.42)]" />
              ) : (
                <span className="flex h-2.5 w-2.5 animate-pulse rounded-full bg-red-500/95 shadow-[0_0_10px_2px_rgba(239,68,68,0.32)]" />
              )}
            </div>

            <motion.h3
              layoutId={`room-title-${room.roomId}`}
              transition={motionTokens.card}
              className="text-xl font-bold text-foreground transition-colors group-hover:text-primary"
            >
              {room.roomName}
            </motion.h3>

            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span className="rf-tabular">{room.capacity} человек</span>
              <span className={`rf-tabular ${room.availableSlots > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{room.availableSlots} слотов</span>
            </div>

            <div className="absolute -inset-px -z-decor rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HubLayer;
