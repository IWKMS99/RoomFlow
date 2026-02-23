import {useQuery} from '@tanstack/react-query';
import {getHolidays} from '../api';
import {queryKeys} from '../queryKeys';

const HOLIDAYS_STALE_TIME = 12 * 60 * 60_000;
const HOLIDAYS_GC_TIME = 24 * 60 * 60_000;

export const useHolidaysQuery = (year: number, country = 'RU') =>
  useQuery({
    queryKey: queryKeys.holidays(year, country),
    queryFn: () => getHolidays(year, country),
    staleTime: HOLIDAYS_STALE_TIME,
    gcTime: HOLIDAYS_GC_TIME,
    retry: 1,
  });
