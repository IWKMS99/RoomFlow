import {useMemo, useState} from 'react';
import type {ScheduleRoomVm, ScheduleViewModel} from '../lib/scheduleViewModel';
import type {DirectSelectionRange} from '../hooks/useDirectBookingSelection';
import {minutesToTime, timeToMinutes} from '../../booking/lib/timeSlots';

interface Props {
  model: ScheduleViewModel;
  selectedRange: DirectSelectionRange | null;
  onSelectionCommit: (range: DirectSelectionRange, anchorRect: DOMRect) => void;
  onSelectionClear?: () => void;
}

interface RoomRow {
  roomId: string;
  roomName: string;
  capacity: number;
  floor: number;
  cells: Array<ScheduleRoomVm | null>;
}

const ScheduleListMobile = ({model, selectedRange, onSelectionCommit, onSelectionClear}: Props) => {
  const [draft, setDraft] = useState<{roomId: string; slotIndex: number} | null>(null);

  const times = useMemo(() => model.slots.map((slot) => slot.time), [model.slots]);

  const slotDurationMinutes = useMemo(() => {
    if (times.length < 2) {
      return 30;
    }
    return Math.max(30, timeToMinutes(times[1]) - timeToMinutes(times[0]));
  }, [times]);

  const rows = useMemo(() => {
    const timeIndexes = new Map<string, number>();
    times.forEach((time, index) => {
      timeIndexes.set(time, index);
    });

    const byRoom = new Map<string, RoomRow>();
    model.slots.forEach((slot) => {
      const timeIndex = timeIndexes.get(slot.time);
      if (timeIndex === undefined) {
        return;
      }

      slot.rooms.forEach((room) => {
        if (!byRoom.has(room.roomId)) {
          byRoom.set(room.roomId, {
            roomId: room.roomId,
            roomName: room.roomName,
            capacity: room.capacity,
            floor: room.floor,
            cells: Array.from({length: times.length}, () => null),
          });
        }

        const row = byRoom.get(room.roomId);
        if (row) {
          row.cells[timeIndex] = room;
        }
      });
    });

    return [...byRoom.values()].sort((left, right) => left.roomName.localeCompare(right.roomName));
  }, [model.slots, times]);

  const resolveRange = (row: RoomRow, anchorIndex: number, targetIndex: number): DirectSelectionRange | null => {
    const isAvailableCell = (index: number) => {
      const cell = row.cells[index];
      return Boolean(cell && cell.isAvailable && !cell.isPast);
    };

    if (!isAvailableCell(anchorIndex)) {
      return null;
    }

    const direction = targetIndex >= anchorIndex ? 1 : -1;
    let clampedTarget = anchorIndex;
    for (let index = anchorIndex; direction > 0 ? index <= targetIndex : index >= targetIndex; index += direction) {
      if (!isAvailableCell(index)) {
        break;
      }
      clampedTarget = index;
    }

    const startIndex = Math.min(anchorIndex, clampedTarget);
    const endIndex = Math.max(anchorIndex, clampedTarget);

    return {
      roomId: row.roomId,
      start: times[startIndex],
      end: minutesToTime(timeToMinutes(times[endIndex]) + slotDurationMinutes),
      slotCount: endIndex - startIndex + 1,
    };
  };

  const isCellSelected = (roomId: string, slotIndex: number) => {
    if (!selectedRange || selectedRange.roomId !== roomId) {
      return false;
    }

    const selectedStartIndex = times.indexOf(selectedRange.start);
    const selectedEndSlot = minutesToTime(timeToMinutes(selectedRange.end) - slotDurationMinutes);
    const selectedEndIndex = times.indexOf(selectedEndSlot);

    if (selectedStartIndex === -1 || selectedEndIndex === -1) {
      return false;
    }

    return slotIndex >= selectedStartIndex && slotIndex <= selectedEndIndex;
  };

  const formatSlotLabel = (time: string) => {
    const end = minutesToTime(timeToMinutes(time) + slotDurationMinutes);
    return `${time}-${end}`;
  };

  return (
    <div className="space-y-3">
      <p className="m-0 text-xs text-muted-foreground">
        Выберите начало и конец встречи в нужной комнате.
      </p>
      {draft && (
        <p className="m-0 rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-xs text-primary">
          Начало диапазона выбрано. Нажмите конечный слот в этой же комнате.
        </p>
      )}

      {rows.map((row) => (
        <article key={row.roomId} className="rounded-2xl border border-white/16 bg-card/62 p-3 shadow-soft">
          <div className="mb-2">
            <p className="m-0 text-sm font-semibold text-foreground">{row.roomName}</p>
            <p className="m-0 text-xs text-muted-foreground">{row.capacity} мест • Этаж {row.floor}</p>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {row.cells.map((cell, index) => {
              const isPast = Boolean(cell?.isPast);
              const isAvailable = Boolean(cell && cell.isAvailable && !cell.isPast);
              const isDraft = draft?.roomId === row.roomId && draft.slotIndex === index;
              const selected = isCellSelected(row.roomId, index);
              const selectedPrev = isCellSelected(row.roomId, index - 1);
              const selectedNext = isCellSelected(row.roomId, index + 1);
              const selectedShapeClass = selected
                ? selectedPrev && selectedNext
                  ? 'rounded-none border-x-0'
                  : selectedPrev
                    ? 'rounded-l-none'
                    : selectedNext
                      ? 'rounded-r-none'
                      : ''
                : '';

              return (
                <button
                  key={`${row.roomId}-${times[index]}`}
                  type="button"
                  disabled={!isAvailable}
                  onClick={(event) => {
                    if (!isAvailable) {
                      return;
                    }

                    if (!draft || draft.roomId !== row.roomId) {
                      setDraft({roomId: row.roomId, slotIndex: index});
                      onSelectionClear?.();
                      return;
                    }

                    const range = resolveRange(row, draft.slotIndex, index);
                    if (!range) {
                      setDraft({roomId: row.roomId, slotIndex: index});
                      return;
                    }

                    onSelectionCommit(range, event.currentTarget.getBoundingClientRect());
                    setDraft(null);
                  }}
                  className={`rounded-lg border px-2 py-2 text-left transition ${selectedShapeClass} ${
                    selected
                      ? 'border-primary bg-primary/30 text-primary-foreground shadow-[0_10px_18px_-14px_hsl(var(--primary)/0.9)]'
                      : isDraft
                        ? 'border-primary/60 bg-primary/20 text-foreground'
                        : isPast
                          ? 'border-white/14 bg-white/7 text-muted-foreground'
                          : isAvailable
                            ? 'border-white/18 bg-background/45 text-foreground'
                            : 'border-white/12 bg-white/12 text-muted-foreground rf-hatch'
                  } ${!isAvailable ? 'cursor-not-allowed' : ''}`}
                  aria-label={`${row.roomName} ${formatSlotLabel(times[index])}`}
                >
                  <p className="m-0 text-[11px] font-semibold">{times[index]}</p>
                  <p className="m-0 text-[10px] text-muted-foreground">
                    {isPast ? 'Прошло' : isAvailable ? 'Свободно' : 'Занято'}
                  </p>
                </button>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
};

export default ScheduleListMobile;
