import {motion, useMotionValue, useReducedMotion, useSpring} from 'framer-motion';
import React from 'react';
import {useMediaQuery} from '../../hooks/useMediaQuery';

type CursorMode = 'default' | 'view' | 'drag';

const modeToLabel: Record<CursorMode, string> = {
  default: '',
  view: 'View',
  drag: 'Drag',
};

const LagCursor = () => {
  const isTouch = useMediaQuery('(pointer: coarse)');
  const reducedMotion = useReducedMotion();
  const [mode, setMode] = React.useState<CursorMode>('default');
  const [visible, setVisible] = React.useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const springX = useSpring(x, {stiffness: 300, damping: 28});
  const springY = useSpring(y, {stiffness: 300, damping: 28});

  React.useEffect(() => {
    if (isTouch || reducedMotion) return;

    const onMove = (event: MouseEvent) => {
      setVisible(true);
      x.set(event.clientX - 16);
      y.set(event.clientY - 16);

      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-cursor="view"]')) {
        setMode('view');
      } else if (target?.closest('[data-cursor="drag"]')) {
        setMode('drag');
      } else {
        setMode('default');
      }
    };

    const onLeave = () => setVisible(false);

    window.addEventListener('mousemove', onMove, {passive: true});
    document.addEventListener('mouseleave', onLeave);

    return () => {
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [isTouch, reducedMotion, x, y]);

  if (isTouch || reducedMotion) {
    return null;
  }

  return (
    <motion.div
      style={{x: springX, y: springY}}
      animate={{opacity: visible ? 1 : 0, scale: mode === 'default' ? 1 : 1.2}}
      transition={{type: 'spring', stiffness: 260, damping: 22}}
      className="pointer-events-none fixed left-0 top-0 z-[120] flex h-8 w-8 items-center justify-center rounded-full border border-primary/45 bg-primary/18 text-[9px] font-semibold uppercase tracking-[0.12em] text-foreground backdrop-blur"
      aria-hidden
    >
      {modeToLabel[mode]}
    </motion.div>
  );
};

export default LagCursor;
