import {useMemo} from 'react';
import type React from 'react';
import {useDrag} from '@use-gesture/react';
import {useReducedMotion} from 'framer-motion';
import type {ScheduleRoomVm, ScheduleViewModel} from '../lib/scheduleViewModel';
import {minutesToTime, timeToMinutes} from '../../booking/lib/timeSlots';
import {useDirectBookingSelection, type DirectSelectionRange} from '../hooks/useDirectBookingSelection';

interface Props {
  model: ScheduleViewModel;
  selectedRange: DirectSelectionRange | null;
  onSelectionCommit: (range: DirectSelectionRange, anchorRect: DOMRect) => void;
  onSelectionClear?: () => void;
  compact?: boolean;
}

interface RoomRow {
  roomId: string;
  roomName: string;
  capacity: number;
  floor: number;
  cells: Array<ScheduleRoomVm | null>;
}

const ScheduleTimelineDesktop = ({
  model,
  selectedRange,
  onSelectionCommit,
  onSelectionClear,
  compact = false,
}: Props) => {
  const reducedMotion = useReducedMotion();
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

  const rowMap = useMemo(() => new Map(rows.map((row) => [row.roomId, row])), [rows]);
  const timeIndexMap = useMemo(() => new Map(times.map((time, index) => [time, index])), [times]);

  const resolveRange = ({
    roomId,
    anchorIndex,
    targetIndex,
  }: {
    roomId: string;
    anchorIndex: number;
    targetIndex: number;
  }): DirectSelectionRange | null => {
    const row = rowMap.get(roomId);
    if (!row) {
      return null;
    }

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

    const start = times[startIndex];
    const end = minutesToTime(timeToMinutes(times[endIndex]) + slotDurationMinutes);

    return {
      roomId,
      start,
      end,
      slotCount: endIndex - startIndex + 1,
    };
  };

  const selection = useDirectBookingSelection({resolveRange});
  const liveRange = selection.state.range ?? selectedRange;

  const toRangeIndexes = (range: DirectSelectionRange | null) => {
    if (!range) {
      return null;
    }

    const startIndex = timeIndexMap.get(range.start);
    const endIndex = timeIndexMap.get(minutesToTime(timeToMinutes(range.end) - slotDurationMinutes));
    if (startIndex === undefined || endIndex === undefined) {
      return null;
    }

    return {
      roomId: range.roomId,
      startIndex,
      endIndex,
    };
  };

  const liveRangeIndexes = toRangeIndexes(liveRange);

  const findCellByPoint = (x: number, y: number): {roomId: string; slotIndex: number} | null => {
    const element = document.elementFromPoint(x, y) as HTMLElement | null;
    const cell = element?.closest<HTMLElement>('[data-room-id][data-slot-index]');
    if (!cell) {
      return null;
    }

    const roomId = cell.dataset.roomId;
    const slotIndex = Number(cell.dataset.slotIndex);
    if (!roomId || Number.isNaN(slotIndex)) {
      return null;
    }

    return {roomId, slotIndex};
  };

  const bind = useDrag(
    ({first, last, xy: [x, y], args: [roomId, slotIndex], event}) => {
      const anchorRoomId = roomId as string;
      const anchorSlotIndex = slotIndex as number;
      const target = event.currentTarget as HTMLElement;
      const hovered = findCellByPoint(x, y);
      const activeSlotIndex =
        hovered && hovered.roomId === anchorRoomId ? hovered.slotIndex : anchorSlotIndex;

      if (first) {
        selection.begin(anchorRoomId, anchorSlotIndex);
      }

      selection.update(anchorRoomId, activeSlotIndex);

      if (last) {
        const committed = selection.finish(anchorRoomId, activeSlotIndex);
        if (committed) {
          onSelectionCommit(committed, target.getBoundingClientRect());
        } else {
          onSelectionClear?.();
        }
      }
    },
    {
      filterTaps: false,
      preventDefault: true,
      pointer: {touch: true},
    }
  );

  if (times.length === 0 || rows.length === 0) {
    return null;
  }

  const roomColumnWidth = compact ? 156 : 184;
  const slotColumnWidth = compact ? 44 : 54;
  const minGridWidth = roomColumnWidth + times.length * slotColumnWidth;
  const columns = `${roomColumnWidth}px repeat(${times.length}, minmax(${slotColumnWidth}px, 1fr))`;

  const onCellKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, roomId: string, slotIndex: number) => {
    if (event.key === 'Enter') {
      const range = resolveRange({roomId, anchorIndex: slotIndex, targetIndex: slotIndex});
      if (range) {
        onSelectionCommit(range, event.currentTarget.getBoundingClientRect());
      }
      return;
    }

    if (!event.shiftKey || !selectedRange || selectedRange.roomId !== roomId) {
      return;
    }

    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') {
      return;
    }

    event.preventDefault();
    const startIndex = timeIndexMap.get(selectedRange.start);
    const currentEndIndex = timeIndexMap.get(minutesToTime(timeToMinutes(selectedRange.end) - slotDurationMinutes));

    if (startIndex === undefined || currentEndIndex === undefined) {
      return;
    }

    const targetIndex = event.key === 'ArrowRight' ? currentEndIndex + 1 : Math.max(startIndex, currentEndIndex - 1);
    const range = resolveRange({roomId, anchorIndex: startIndex, targetIndex});
    if (range) {
      onSelectionCommit(range, event.currentTarget.getBoundingClientRect());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className="inline-flex h-2.5 w-2.5 rounded-full border border-primary/45 bg-transparent" />
        Свободно
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/35" />
        Занято
        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.35)]" />
        Ваш выбор
      </div>

      <div
        className="w-full max-w-full overflow-x-auto rounded-3xl border border-white/16 bg-card/45 shadow-trench rf-scrollbar"
      >
        <div style={{minWidth: `${minGridWidth}px`}}>
          <div className="grid" style={{gridTemplateColumns: columns}}>
            <div className="sticky left-0 z-sticky border-b border-r border-white/14 bg-card/85 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground backdrop-blur">
              Переговорки
            </div>

            {times.map((time) => (
              <div
                key={`header-${time}`}
                className="border-b border-r border-white/5 bg-card/78 px-2 py-3 text-center text-xs font-semibold text-muted-foreground"
              >
                {time}
              </div>
            ))}

            {rows.map((row) => {
              const rowSelection =
                liveRangeIndexes && liveRangeIndexes.roomId === row.roomId
                  ? {
                      left: `${(liveRangeIndexes.startIndex / times.length) * 100}%`,
                      width: `${((liveRangeIndexes.endIndex - liveRangeIndexes.startIndex + 1) / times.length) * 100}%`,
                    }
                  : null;

              return (
                <div key={row.roomId} className="contents">
                  <div className="sticky left-0 z-content border-b border-r border-white/14 bg-card/92 px-4 py-3 backdrop-blur">
                    <p className="m-0 text-sm font-semibold text-foreground">{row.roomName}</p>
                    <p className="rf-tabular m-0 text-xs text-muted-foreground">
                      {row.capacity} мест • Этаж {row.floor}
                    </p>
                  </div>

                  <div
                    className="relative col-[2/-1] grid border-b border-white/14"
                    style={{gridTemplateColumns: `repeat(${times.length}, minmax(0, 1fr))`}}
                  >
                    {rowSelection && (
                      <span
                        className={`pointer-events-none absolute bottom-1.5 top-1.5 z-base rounded-xl border border-primary/45 bg-primary/18 shadow-[0_0_0_1px_hsl(var(--primary)/0.24),0_16px_34px_-24px_hsl(var(--primary)/0.95)] ${
                          reducedMotion ? '' : 'rf-selection-sheen'
                        }`}
                        style={{
                          left: rowSelection.left,
                          width: rowSelection.width,
                        }}
                      />
                    )}

                    {row.cells.map((cell, index) => {
                      const isPast = Boolean(cell?.isPast);
                      const isAvailable = Boolean(cell && cell.isAvailable && !cell.isPast);
                      const inActiveRange =
                        Boolean(
                          liveRangeIndexes &&
                            liveRangeIndexes.roomId === row.roomId &&
                            index >= liveRangeIndexes.startIndex &&
                            index <= liveRangeIndexes.endIndex
                        );
                      const showCueHandles = isAvailable && !inActiveRange;

                      const baseClass =
                        'group relative z-content h-14 whitespace-nowrap border-r border-white/5 px-1.5 text-center text-[10px] font-semibold text-muted-foreground transition';

                      const stateClass = isAvailable
                        ? 'bg-transparent text-foreground hover:bg-primary/[0.08]'
                        : isPast
                          ? 'bg-muted/45 text-muted-foreground'
                          : 'bg-white/12 text-muted-foreground rf-hatch';

                      const statusLabel = inActiveRange
                        ? 'Выбор'
                        : isPast
                          ? 'Прошло'
                          : isAvailable
                            ? 'Своб.'
                            : 'Занято';

                      return (
                        <button
                          key={`${row.roomId}-${times[index]}`}
                          type="button"
                          data-room-id={row.roomId}
                          data-slot-index={index}
                          {...bind(row.roomId, index)}
                          onKeyDown={(event) => onCellKeyDown(event, row.roomId, index)}
                          disabled={!isAvailable}
                          className={`${baseClass} ${stateClass} ${!isAvailable ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} ${
                            reducedMotion ? '' : 'hover:scale-[0.985]'
                          }`}
                          style={{touchAction: 'none', userSelect: 'none'}}
                          aria-label={`${row.roomName} ${times[index]} ${isAvailable ? 'свободно' : 'занято'}`}
                          title={`${times[index]} • ${isPast ? 'Прошло' : isAvailable ? 'Свободно' : 'Занято'}`}
                        >
                          {showCueHandles && (
                            <>
                              <span className="pointer-events-none absolute left-1.5 top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-white/35 opacity-0 transition group-hover:opacity-100" />
                              <span className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-[2px] -translate-y-1/2 rounded-full bg-white/35 opacity-0 transition group-hover:opacity-100" />
                            </>
                          )}

                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            {inActiveRange ? (
                              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_0_2px_hsl(var(--primary)/0.3)]" />
                            ) : isAvailable ? (
                              <span className="h-2 w-2 rounded-full border border-white/40 bg-transparent" />
                            ) : isPast ? (
                              <span className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-white/35" />
                            )}
                          </span>
                          <span className="sr-only">{statusLabel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleTimelineDesktop;
