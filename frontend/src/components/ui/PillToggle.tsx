import type React from 'react';
import {motion, useReducedMotion} from 'framer-motion';
import {cn} from '../../lib/utils';
import {motionPreset} from '../../lib/motion';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  groupId?: string;
  itemId?: string;
}

const PillToggle = ({active = false, groupId, itemId, className, type = 'button', children, ...props}: Props) => {
  const reducedMotion = useReducedMotion();
  const sharedLayoutId = groupId ? `pill-toggle-active-${groupId}` : undefined;

  return (
    <button
      type={type}
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden rounded-full border px-3.5 py-1.5 text-xs font-semibold transition',
        active
          ? 'border-primary/50 text-foreground shadow-[0_8px_20px_-12px_hsl(var(--primary)/0.8)]'
          : 'border-white/15 bg-white/6 text-muted-foreground hover:bg-white/12 hover:text-foreground',
        className
      )}
      data-pill-item={itemId}
      {...props}
    >
      {active && sharedLayoutId && (
        <motion.span
          layoutId={sharedLayoutId}
          aria-hidden="true"
          transition={reducedMotion ? motionPreset.quick : motionPreset.springGentle}
          className="absolute inset-0 bg-primary/28"
        />
      )}
      {active && !sharedLayoutId && <span aria-hidden="true" className="absolute inset-0 bg-primary/28" />}
      <span className="relative z-base inline-flex items-center gap-1">{children}</span>
    </button>
  );
};

export default PillToggle;
