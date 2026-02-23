import type {RoomInSchedule, ScheduleView} from '../../../types/booking';

export interface ScheduleRoomVm {
  roomId: string;
  roomName: string;
  capacity: number;
  floor: number;
  isAvailable: boolean;
  isPast: boolean;
  coverImageUrl?: string | null;
}

export interface ScheduleSlotVm {
  time: string;
  label: string;
  rooms: ScheduleRoomVm[];
  availableCount: number;
  totalRooms: number;
  isPast: boolean;
}

export interface ScheduleViewModel {
  slots: ScheduleSlotVm[];
}

const normalizeTime = (value: string) => value.slice(0, 5);

const buildLabel = (time: string) => {
  const [hours, minutes] = normalizeTime(time).split(':').map(Number);
  const nextHours = String(hours + 1).padStart(2, '0');
  const nextMinutes = String(minutes).padStart(2, '0');
  return `${normalizeTime(time)} - ${nextHours}:${nextMinutes}`;
};

const mapRoom = (room: RoomInSchedule): ScheduleRoomVm => ({
  roomId: room.roomId,
  roomName: room.roomName,
  capacity: room.capacity,
  floor: room.floor,
  isAvailable: room.isAvailable,
  isPast: false,
  coverImageUrl: room.coverImageUrl ?? null,
});

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

export const createScheduleViewModel = (
  schedule: ScheduleView | null,
  selectedDate: Date
): ScheduleViewModel => {
  if (!schedule) {
    return {slots: []};
  }

  const now = new Date();
  const isToday = isSameDay(selectedDate, now);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const slots = schedule.timeSlots
    .map((slot) => {
      const normalizedTime = normalizeTime(slot.time);
      const [hours, minutes] = normalizedTime.split(':').map(Number);
      const slotStartMinutes = hours * 60 + minutes;
      const isPast = isToday && slotStartMinutes <= nowMinutes;

      const rooms = slot.rooms.map((room) => {
        const mapped = mapRoom(room);
        if (isPast) {
          return {
            ...mapped,
            isAvailable: false,
            isPast: true,
          };
        }

        return mapped;
      });
      const availableCount = rooms.filter((room) => room.isAvailable).length;
      return {
        time: normalizedTime,
        label: buildLabel(slot.time),
        rooms,
        availableCount,
        totalRooms: rooms.length,
        isPast,
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return {slots};
};
