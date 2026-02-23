import {useMediaQuery} from '../../../hooks/useMediaQuery';

export const useScheduleViewMode = () => {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  return {
    isDesktop,
    mode: isDesktop ? 'desktop' as const : 'mobile' as const,
  };
};
