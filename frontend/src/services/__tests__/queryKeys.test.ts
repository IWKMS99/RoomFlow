import {describe, expect, it} from 'vitest';
import {queryKeys} from '../queryKeys';

describe('queryKeys', () => {
  it('builds stable key contracts', () => {
    expect(queryKeys.schedule('2026-02-23')).toEqual(['schedule', '2026-02-23']);
    expect(queryKeys.room('room-1', '2026-02-23')).toEqual(['room', 'room-1', '2026-02-23']);
    expect(queryKeys.myBookings()).toEqual(['myBookings']);
    expect(queryKeys.adminUsers()).toEqual(['adminUsers']);
    expect(queryKeys.adminBookings({date: '2026-02-23', status: 'CONFIRMED'})).toEqual([
      'adminBookings',
      {date: '2026-02-23', status: 'CONFIRMED'},
    ]);
  });
});
