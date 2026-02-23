import {useRef, useState} from 'react';

export interface DirectSelectionRange {
  roomId: string;
  start: string;
  end: string;
  slotCount: number;
}

export interface DirectSelectionState {
  status: 'idle' | 'dragging' | 'selected';
  range: DirectSelectionRange | null;
  anchorSlotIndex: number | null;
  anchorRoomId: string | null;
}

export interface QuickBookSuggestion {
  roomId: string;
  roomName: string;
  start: string;
  end: string;
  startsInMinutes: number;
}

interface ResolveArgs {
  roomId: string;
  anchorIndex: number;
  targetIndex: number;
}

interface Params {
  resolveRange: (args: ResolveArgs) => DirectSelectionRange | null;
}

export const useDirectBookingSelection = ({resolveRange}: Params) => {
  const anchorSlotRef = useRef<number | null>(null);
  const anchorRoomRef = useRef<string | null>(null);
  const draggingRef = useRef(false);

  const [state, setState] = useState<DirectSelectionState>({
    status: 'idle',
    range: null,
    anchorSlotIndex: null,
    anchorRoomId: null,
  });

  const begin = (roomId: string, slotIndex: number) => {
    anchorSlotRef.current = slotIndex;
    anchorRoomRef.current = roomId;
    draggingRef.current = true;

    setState({
      status: 'dragging',
      range: resolveRange({roomId, anchorIndex: slotIndex, targetIndex: slotIndex}),
      anchorSlotIndex: slotIndex,
      anchorRoomId: roomId,
    });
  };

  const update = (roomId: string, slotIndex: number) => {
    if (!draggingRef.current || anchorSlotRef.current === null || anchorRoomRef.current !== roomId) {
      return;
    }

    setState((current) => ({
      ...current,
      range: resolveRange({roomId, anchorIndex: anchorSlotRef.current as number, targetIndex: slotIndex}),
    }));
  };

  const finish = (roomId: string, slotIndex: number): DirectSelectionRange | null => {
    if (!draggingRef.current || anchorSlotRef.current === null || anchorRoomRef.current !== roomId) {
      return null;
    }

    const resolvedRange = resolveRange({roomId, anchorIndex: anchorSlotRef.current, targetIndex: slotIndex});
    draggingRef.current = false;
    anchorSlotRef.current = null;
    anchorRoomRef.current = null;

    setState({
      status: resolvedRange ? 'selected' : 'idle',
      range: resolvedRange,
      anchorSlotIndex: null,
      anchorRoomId: null,
    });

    return resolvedRange;
  };

  const clear = () => {
    draggingRef.current = false;
    anchorSlotRef.current = null;
    anchorRoomRef.current = null;

    setState({status: 'idle', range: null, anchorSlotIndex: null, anchorRoomId: null});
  };

  const setSelected = (range: DirectSelectionRange | null) => {
    draggingRef.current = false;
    anchorSlotRef.current = null;
    anchorRoomRef.current = null;

    setState({
      status: range ? 'selected' : 'idle',
      range,
      anchorSlotIndex: null,
      anchorRoomId: null,
    });
  };

  return {
    state,
    begin,
    update,
    finish,
    clear,
    setSelected,
  };
};
