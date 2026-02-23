import {useEffect, useMemo, useRef} from 'react';
import {useGridField} from '../../hooks/useGridField';
import {cn} from '../../lib/utils';

type ThemeVariant = 'light' | 'dark';

interface Props {
  theme: ThemeVariant;
}

const SPACING = 40;
const RESOLUTION = 24;
const CURSOR_INFLUENCE = 280;
const CURSOR_FORCE = 0.6;
const ELEMENT_FORCE = 0.52;
const EPSILON = 0.0001;

interface FieldSnapshot {
  cursorX: number;
  cursorY: number;
  cursorStrength: number;
  elementX: number;
  elementY: number;
  elementRadius: number;
  elementStrength: number;
}

interface CanvasSize {
  width: number;
  height: number;
  dpr: number;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hasMeaningfulDiff = (next: FieldSnapshot, prev: FieldSnapshot) =>
  Math.abs(next.cursorX - prev.cursorX) > EPSILON ||
  Math.abs(next.cursorY - prev.cursorY) > EPSILON ||
  Math.abs(next.cursorStrength - prev.cursorStrength) > EPSILON ||
  Math.abs(next.elementX - prev.elementX) > EPSILON ||
  Math.abs(next.elementY - prev.elementY) > EPSILON ||
  Math.abs(next.elementRadius - prev.elementRadius) > EPSILON ||
  Math.abs(next.elementStrength - prev.elementStrength) > EPSILON;

const LiveGridLayer = ({theme}: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const {enabled, stateRef: fieldRef} = useGridField(containerRef);
  const sizeRef = useRef<CanvasSize>({
    width: 0,
    height: 0,
    dpr: 1,
  });
  const previousFieldRef = useRef<FieldSnapshot>({
    cursorX: -1,
    cursorY: -1,
    cursorStrength: -1,
    elementX: -1,
    elementY: -1,
    elementRadius: -1,
    elementStrength: -1,
  });

  const gridColor = useMemo(
    () => (theme === 'light' ? 'rgba(100, 116, 139, 0.25)' : 'rgba(148, 163, 184, 0.12)'),
    [theme]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !enabled) return;

    const ctx = canvas.getContext('2d', {alpha: true});
    if (!ctx) return;

    let animationFrameId = 0;
    let resizeObserver: ResizeObserver | null = null;
    let forceRender = true;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = clamp(window.devicePixelRatio || 1, 1, 2);

      if (sizeRef.current.width === width && sizeRef.current.height === height && sizeRef.current.dpr === dpr) {
        return;
      }

      sizeRef.current = {width, height, dpr};
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      forceRender = true;
    };

    resizeCanvas();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resizeCanvas);
      resizeObserver.observe(container);
    } else {
      window.addEventListener('resize', resizeCanvas, {passive: true});
    }

    const render = () => {
      const liveField = fieldRef.current;
      const nextField = {
        cursorX: liveField.cursorX,
        cursorY: liveField.cursorY,
        cursorStrength: liveField.cursorStrength,
        elementX: liveField.elementX,
        elementY: liveField.elementY,
        elementRadius: liveField.elementRadius,
        elementStrength: liveField.elementStrength,
      };
      const prevField = previousFieldRef.current;
      const shouldDraw = forceRender || hasMeaningfulDiff(nextField, prevField);

      if (!shouldDraw) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      forceRender = false;
      previousFieldRef.current = nextField;

      const {width, height} = sizeRef.current;

      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1;
      ctx.strokeStyle = gridColor;
      ctx.beginPath();

      const getDisplacement = (x: number, y: number): [number, number] => {
        const cursorStrength = nextField.cursorStrength * CURSOR_FORCE;
        const elementStrength = nextField.elementStrength * ELEMENT_FORCE;
        if (cursorStrength <= 0.01 && elementStrength <= 0.01) return [0, 0];

        let displacementX = 0;
        let displacementY = 0;

        if (cursorStrength > 0.01) {
          const dx = x - nextField.cursorX;
          const dy = y - nextField.cursorY;
          const distSq = dx * dx + dy * dy;
          if (distSq <= CURSOR_INFLUENCE * CURSOR_INFLUENCE) {
            const dist = Math.max(Math.sqrt(distSq), 0.0001);
            const factor = Math.exp(-distSq / (CURSOR_INFLUENCE * 80));
            const pull = factor * cursorStrength * 100;
            displacementX += (dx / dist) * pull;
            displacementY += (dy / dist) * pull;
          }
        }

        if (elementStrength > 0.01) {
          const dx = x - nextField.elementX;
          const dy = y - nextField.elementY;
          const radius = clamp(nextField.elementRadius, 56, 320);
          const distSq = dx * dx + dy * dy;
          if (distSq <= radius * radius) {
            const dist = Math.max(Math.sqrt(distSq), 0.0001);
            const factor = Math.exp(-distSq / (radius * 58));
            const pull = factor * elementStrength * 74;
            displacementX += (dx / dist) * pull;
            displacementY += (dy / dist) * pull;
          }
        }

        return [displacementX, displacementY];
      };

      for (let x = 0; x <= width; x += SPACING) {
        let isFirstPoint = true;
        for (let y = 0; y <= height; y += RESOLUTION) {
          const [dx, dy] = getDisplacement(x, y);
          if (isFirstPoint) {
            ctx.moveTo(x + dx, y + dy);
            isFirstPoint = false;
          } else {
            ctx.lineTo(x + dx, y + dy);
          }
        }
      }

      for (let y = 0; y <= height; y += SPACING) {
        let isFirstPoint = true;
        for (let x = 0; x <= width; x += RESOLUTION) {
          const [dx, dy] = getDisplacement(x, y);
          if (isFirstPoint) {
            ctx.moveTo(x + dx, y + dy);
            isFirstPoint = false;
          } else {
            ctx.lineTo(x + dx, y + dy);
          }
        }
      }

      ctx.stroke();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', resizeCanvas);
      }
    };
  }, [enabled, fieldRef, gridColor]);

  if (!enabled) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute inset-0 rf-stage-grid',
          theme === 'light' ? 'rf-stage-grid--light' : 'rf-stage-grid--dark'
        )}
        style={{backgroundSize: `${SPACING}px ${SPACING}px`}}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={cn('pointer-events-none absolute inset-0 rf-live-grid', theme === 'light' ? 'rf-stage-grid--light' : 'rf-stage-grid--dark')}
    >
      <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" />
      <div className="rf-live-grid__shade" />
    </div>
  );
};

export default LiveGridLayer;
