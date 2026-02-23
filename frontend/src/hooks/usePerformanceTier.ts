import {useMemo} from 'react';
import {useReducedMotion} from 'framer-motion';
import {useMediaQuery} from './useMediaQuery';

export type PerformanceTier = 'low' | 'medium' | 'high';

export const usePerformanceTier = (): PerformanceTier => {
  const reducedMotion = useReducedMotion();
  const coarsePointer = useMediaQuery('(pointer: coarse)');
  const lowRes = useMediaQuery('(max-width: 768px)');

  return useMemo(() => {
    if (reducedMotion) return 'low';

    const deviceMemory = typeof navigator !== 'undefined' ? (navigator as Navigator & {deviceMemory?: number}).deviceMemory : undefined;
    if (coarsePointer && lowRes) return 'low';
    if (typeof deviceMemory === 'number' && deviceMemory <= 4) return 'low';
    if (coarsePointer || lowRes) return 'medium';

    return 'high';
  }, [coarsePointer, lowRes, reducedMotion]);
};
