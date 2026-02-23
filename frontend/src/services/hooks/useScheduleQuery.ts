import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchSchedule} from '../api';
import {queryKeys} from '../queryKeys';
import {createScheduleViewModel} from '../../features/schedule/lib/scheduleViewModel';
import {formatDateForApi} from '../../lib/datetime/dateKey';

export const SCHEDULE_STALE_TIME = 30_000;
export const SCHEDULE_GC_TIME = 10 * 60_000;
export const SCHEDULE_REFETCH_INTERVAL = 10_000;

export const useScheduleQuery = (selectedDate: Date) => {
  const dateKey = formatDateForApi(selectedDate);

  const query = useQuery({
    queryKey: queryKeys.schedule(dateKey),
    queryFn: () => fetchSchedule(dateKey),
    placeholderData: (previousData) => previousData,
    staleTime: SCHEDULE_STALE_TIME,
    gcTime: SCHEDULE_GC_TIME,
    refetchInterval: SCHEDULE_REFETCH_INTERVAL,
    refetchIntervalInBackground: true,
  });

  const model = useMemo(() => createScheduleViewModel(query.data ?? null, selectedDate), [query.data, selectedDate]);

  return {
    ...query,
    dateKey,
    model,
  };
};
