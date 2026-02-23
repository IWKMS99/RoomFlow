import React from 'react';
import {motion} from 'framer-motion';
import {useNavigate} from 'react-router-dom';
import {formatDateForApi, normalizeDate, parseDateKey} from '../../lib/datetime/dateKey';
import {useHubStore} from '../../store/useHubStore';
import {useScheduleQuery} from '../../services/hooks/useScheduleQuery';
import type {ScheduleRoomVm} from '../../features/schedule/lib/scheduleViewModel';

interface RoomSummary extends Omit<ScheduleRoomVm, 'isPast' | 'isAvailable'> {
  availableSlots: number;
}

const HubLayer = () => {
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

  return (
    <div className="h-full w-full overflow-y-auto p-6 md:p-12">
      <div className="mx-auto mb-10 flex max-w-7xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">Бронирование</h1>
          <p className="mt-2 text-lg text-muted-foreground">Выберите переговорную комнату</p>
        </div>

        <div className="flex items-center gap-2 rounded-lg bg-white/5 p-1 backdrop-blur-md">
          <button className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white shadow-sm">Сегодня</button>
          <button className="rounded-md px-4 py-2 text-sm font-medium text-muted-foreground hover:text-white">Завтра</button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading && <div className="text-white">Загрузка расписания...</div>}

        {!isLoading && rooms.map((room) => (
          <motion.div
            key={room.roomId}
            layoutId={`room-card-${room.roomId}`}
            data-room-id={room.roomId}
            onClick={() => {
              useHubStore.getState().enterRoom(room.roomId);
              navigate(`/schedule/room/${room.roomId}`);
            }}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 transition-colors hover:border-primary/50 hover:bg-white/10"
          >
            <div className="mb-4 flex items-start justify-between">
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                {room.floor} этаж
              </div>
              {room.availableSlots > 0 ? (
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.3)]" />
              ) : (
                <span className="flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </div>

            <motion.h3 layoutId={`room-title-${room.roomId}`} className="text-xl font-bold text-white transition-colors group-hover:text-primary">
              {room.roomName}
            </motion.h3>

            <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
              <span>{room.capacity} человек</span>
              <span className={room.availableSlots > 0 ? 'text-emerald-400' : 'text-red-400'}>{room.availableSlots} слотов</span>
            </div>

            <div className="absolute -inset-px -z-10 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HubLayer;
