import React from 'react';
import {describe, expect, it, vi, beforeEach} from 'vitest';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {renderHook, waitFor} from '@testing-library/react';
import {useCancelBookingMutation} from '../hooks/useCancelBookingMutation';
import {queryKeys} from '../queryKeys';

vi.mock('../api', () => ({
  cancelBooking: vi.fn(),
}));

import {cancelBooking} from '../api';

const wrapperFor = (client: QueryClient) => ({children}: {children: React.ReactNode}) =>
  <QueryClientProvider client={client}>{children}</QueryClientProvider>;

describe('useCancelBookingMutation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('optimistically sets booking to CANCELLED and rolls back on failure', async () => {
    const client = new QueryClient({defaultOptions: {queries: {retry: false}, mutations: {retry: false}}});
    client.setQueryData(queryKeys.myBookings(), [
      {id: 'b1', status: 'CONFIRMED', roomId: 'r1', roomName: 'R', capacity: 1, floor: 1, userId: 'u', startTime: '2026-02-23T10:00:00', endTime: '2026-02-23T10:30:00'},
    ]);

    vi.mocked(cancelBooking).mockRejectedValueOnce(new Error('boom'));

    const {result} = renderHook(() => useCancelBookingMutation('2026-02-23'), {
      wrapper: wrapperFor(client),
    });

    result.current.mutate('b1');

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    const data = client.getQueryData<Array<{id: string; status: string}>>(queryKeys.myBookings()) ?? [];
    expect(data[0]?.status).toBe('CONFIRMED');
  });
});
