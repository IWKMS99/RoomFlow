import {AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring} from 'framer-motion';
import {useEffect, useMemo, useRef, useState} from 'react';
import {useMediaQuery} from '../../hooks/useMediaQuery';
import {cn} from '../../lib/utils';
import {getCursorFallbackText, resolveCursorState, type CursorState} from './cursorHeuristics';

const IDLE_HIDE_MS = 1400;

const LagCursor = () => {
  const isTouch = useMediaQuery('(pointer: coarse)');
  const reducedMotion = useReducedMotion();
  const [cursorState, setCursorState] = useState<CursorState>({mode: 'default', text: '', source: 'default'});
  const [isVisible, setIsVisible] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const dotX = useSpring(mouseX, {stiffness: 900, damping: 56, mass: 0.32});
  const dotY = useSpring(mouseY, {stiffness: 900, damping: 56, mass: 0.32});
  const ringX = useSpring(mouseX, {stiffness: 220, damping: 24, mass: 0.7});
  const ringY = useSpring(mouseY, {stiffness: 220, damping: 24, mass: 0.7});
  const glowX = useSpring(mouseX, {stiffness: 110, damping: 20, mass: 1.15});
  const glowY = useSpring(mouseY, {stiffness: 110, damping: 20, mass: 1.15});

  const idleTimeoutRef = useRef<number | null>(null);
  const pendingCursorResolveFrameRef = useRef<number | null>(null);
  const latestPointerTargetRef = useRef<EventTarget | null>(null);
  const cursorStateRef = useRef(cursorState);
  const visibleRef = useRef(isVisible);

  useEffect(() => {
    cursorStateRef.current = cursorState;
  }, [cursorState]);

  useEffect(() => {
    visibleRef.current = isVisible;
  }, [isVisible]);

  const ringVariants = useMemo(
    () => ({
      default: {width: 30, height: 30, borderRadius: '999px', rotate: 0},
      view: {width: 62, height: 62, borderRadius: '999px', rotate: 0},
      book: {width: 112, height: 40, borderRadius: '14px', rotate: 0},
      admin: {width: 48, height: 48, borderRadius: '12px', rotate: 12},
      danger: {width: 102, height: 40, borderRadius: '14px', rotate: 0},
      drag: {width: 78, height: 78, borderRadius: '999px', rotate: 0},
      locked: {width: 24, height: 24, borderRadius: '999px', rotate: 0},
    }),
    []
  );

  useEffect(() => {
    if (isTouch || reducedMotion) {
      document.documentElement.classList.remove('rf-lag-cursor-active');
      return;
    }

    document.documentElement.classList.add('rf-lag-cursor-active');

    const clearIdle = () => {
      if (idleTimeoutRef.current !== null) {
        window.clearTimeout(idleTimeoutRef.current);
        idleTimeoutRef.current = null;
      }
    };
    const clearPendingResolve = () => {
      if (pendingCursorResolveFrameRef.current !== null) {
        window.cancelAnimationFrame(pendingCursorResolveFrameRef.current);
        pendingCursorResolveFrameRef.current = null;
      }
    };

    const scheduleIdleHide = () => {
      clearIdle();
      idleTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(false);
      }, IDLE_HIDE_MS);
    };

    const handleMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }

      mouseX.set(event.clientX);
      mouseY.set(event.clientY);
      if (!visibleRef.current) {
        setIsVisible(true);
        visibleRef.current = true;
      }

      latestPointerTargetRef.current = event.target;
      if (pendingCursorResolveFrameRef.current === null) {
        pendingCursorResolveFrameRef.current = window.requestAnimationFrame(() => {
          pendingCursorResolveFrameRef.current = null;
          const next = resolveCursorState(latestPointerTargetRef.current);
          const prev = cursorStateRef.current;
          if (next.mode !== prev.mode || next.text !== prev.text || next.source !== prev.source) {
            setCursorState(next);
          }
        });
      }

      scheduleIdleHide();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }
      setIsPressed(true);
    };

    const handlePointerUp = () => setIsPressed(false);

    const handleWindowBlur = () => {
      setIsPressed(false);
      setIsVisible(false);
    };

    const handleMouseOut = (event: MouseEvent) => {
      if (!event.relatedTarget) {
        setIsPressed(false);
        setIsVisible(false);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') {
        setIsVisible(false);
        setIsPressed(false);
      }
    };

    window.addEventListener('pointermove', handleMove, {passive: true});
    window.addEventListener('pointerdown', handlePointerDown, {passive: true});
    window.addEventListener('pointerup', handlePointerUp, {passive: true});
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('visibilitychange', handleVisibility);

    scheduleIdleHide();

    return () => {
      clearIdle();
      clearPendingResolve();
      document.documentElement.classList.remove('rf-lag-cursor-active');
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('mouseout', handleMouseOut);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isTouch, reducedMotion, mouseX, mouseY]);

  if (isTouch || reducedMotion) {
    return null;
  }

  const mode = cursorState.mode;
  const text = cursorState.text || getCursorFallbackText(mode);

  return (
    <div className="pointer-events-none fixed inset-0 z-cursor select-none">
      <motion.div
        style={{x: glowX, y: glowY, translateX: '-50%', translateY: '-50%'}}
        animate={{
          opacity: isVisible ? (mode === 'default' ? 0.2 : 0.34) : 0,
          scale: isPressed ? 0.86 : 1,
        }}
        transition={{duration: 0.18, ease: 'easeOut'}}
        className="absolute h-28 w-28 rounded-full bg-[radial-gradient(circle,hsl(var(--primary)/0.28)_0%,hsl(var(--primary)/0.06)_36%,transparent_72%)] blur-md"
      />

      <motion.div
        style={{x: ringX, y: ringY, translateX: '-50%', translateY: '-50%'}}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isPressed ? 0.92 : 1,
          ...ringVariants[mode],
        }}
        transition={{type: 'spring', stiffness: 360, damping: 30, mass: 0.4}}
        className={cn(
          'absolute flex items-center justify-center border text-[10px] font-semibold tracking-[0.12em] backdrop-blur-[2px]',
          mode === 'default' && 'border-primary/35 bg-primary/5',
          mode === 'view' && 'border-primary/55 bg-primary/12 text-primary-foreground/90',
          mode === 'book' && 'border-success/55 bg-success/16 text-foreground',
          mode === 'drag' && 'border-primary/60 bg-primary/14 text-foreground',
          mode === 'admin' && 'border-warning/55 bg-warning/18 text-foreground',
          mode === 'danger' && 'border-danger/60 bg-danger/16 text-danger-foreground',
          mode === 'locked' && 'border-white/35 bg-white/8 text-muted-foreground'
        )}
      >
        <AnimatePresence mode="wait">
          {(text || mode !== 'default') && (
            <motion.span
              key={`${mode}-${text}-${cursorState.source}`}
              initial={{opacity: 0, y: 4, scale: 0.94}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: -4, scale: 0.9}}
              transition={{duration: 0.14}}
              className="rf-meta pointer-events-none whitespace-nowrap"
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        style={{x: dotX, y: dotY, translateX: '-50%', translateY: '-50%'}}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: mode === 'locked' ? 0.45 : isPressed ? 0.72 : 1,
        }}
        transition={{type: 'spring', stiffness: 700, damping: 40}}
        className={cn(
          'absolute rounded-full shadow-[0_0_16px_hsl(var(--primary)/0.95)]',
          mode === 'book' ? 'h-2.5 w-2.5 bg-success' : mode === 'danger' ? 'h-2.5 w-2.5 bg-danger shadow-[0_0_16px_hsl(var(--danger)/0.9)]' : 'h-2 w-2 bg-primary'
        )}
      />
    </div>
  );
};

export default LagCursor;
