import type React from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {motionPreset, motionVariant} from '../../lib/motion';

interface Props {
  children: React.ReactNode;
  pageKey: string;
  intent?: 'standard' | 'fast';
  direction?: -1 | 0 | 1;
  isTabNavigation?: boolean;
}

const PageTransition = ({children, pageKey, intent = 'standard', direction = 0, isTabNavigation = false}: Props) => {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div key={pageKey}>{children}</div>;
  }

  const transition = intent === 'fast' ? motionPreset.standard : motionPreset.smoothSoft;
  const hasDirection = isTabNavigation && direction !== 0;

  return (
    <motion.div
      key={pageKey}
      custom={direction}
      variants={hasDirection ? motionVariant.slideHorizontal : motionVariant.screen}
      initial={hasDirection ? 'initial' : 'initial'}
      animate={hasDirection ? 'animate' : 'animate'}
      exit={hasDirection ? 'exit' : 'exit'}
      transition={transition}
      layout={!hasDirection}
      className="[grid-area:1/1] w-full"
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
