import type {PropsWithChildren} from 'react';
import {motion} from 'framer-motion';
import {cn} from '../../lib/utils';

interface MorphingCardProps extends PropsWithChildren {
  layoutId: string;
  className?: string;
  onClick?: () => void;
}

const MorphingCard = ({layoutId, className, onClick, children}: MorphingCardProps) => (
  <motion.article
    layoutId={layoutId}
    onClick={onClick}
    transition={{type: 'spring', stiffness: 300, damping: 22}}
    className={cn(
      'rounded-2xl border border-white/16 bg-card/70 p-4 shadow-soft backdrop-blur transition will-change-transform',
      className
    )}
  >
    {children}
  </motion.article>
);

export default MorphingCard;
