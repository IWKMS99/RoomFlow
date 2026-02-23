import {type RefObject, useEffect, useMemo, useRef} from 'react';
import {useReducedMotion} from 'framer-motion';
import {useMediaQuery} from './useMediaQuery';
import {usePerformanceTier} from './usePerformanceTier';

const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, [role="button"], [data-cursor]';
const DEFAULT_CURSOR_STRENGTH = 0.62;
const DEFAULT_ELEMENT_STRENGTH = 0.68;
const STRONG_ELEMENT_STRENGTH = 0.94;
const MAX_TILT = 2.5;
const LERP_FACTOR = 0.17;

interface GridFieldVector {
  cursorX: number;
  cursorY: number;
  cursorStrength: number;
  elementX: number;
  elementY: number;
  elementRadius: number;
  elementStrength: number;
  tiltX: number;
  tiltY: number;
}

export interface GridFieldState extends GridFieldVector {
  enabled: boolean;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const lerp = (start: number, end: number, alpha: number) => start + (end - start) * alpha;

const getViewportCenter = () => {
  if (typeof window === 'undefined') {
    return {x: 0, y: 0};
  }
  return {x: window.innerWidth * 0.5, y: window.innerHeight * 0.5};
};

const createBaseVector = (): GridFieldVector => {
  const center = getViewportCenter();
  return {
    cursorX: center.x,
    cursorY: center.y,
    cursorStrength: 0,
    elementX: center.x,
    elementY: center.y,
    elementRadius: 120,
    elementStrength: 0,
    tiltX: 0,
    tiltY: 0,
  };
};

const resolveInfluenceTarget = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof Element)) {
    return null;
  }
  const candidate = target.closest<HTMLElement>(INTERACTIVE_SELECTOR);
  if (!candidate) {
    return null;
  }

  const influence = candidate.dataset.gridInfluence;
  if (influence === 'off') {
    return null;
  }

  return candidate;
};

const getInfluenceStrength = (element: HTMLElement): number => {
  const influence = element.dataset.gridInfluence;
  if (influence === 'strong') {
    return STRONG_ELEMENT_STRENGTH;
  }
  return DEFAULT_ELEMENT_STRENGTH;
};

const applyElementField = (target: GridFieldVector, element: HTMLElement, strength: number) => {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) {
    target.elementStrength = 0;
    return;
  }

  target.elementX = rect.left + rect.width * 0.5;
  target.elementY = rect.top + rect.height * 0.5;
  target.elementRadius = clamp(Math.max(rect.width, rect.height) * 0.7, 56, 220);
  target.elementStrength = strength;
};

const applyGridCssVariables = (container: HTMLElement, state: GridFieldState) => {
  const style = container.style;
  style.setProperty('--rf-grid-cx', `${state.cursorX.toFixed(2)}px`);
  style.setProperty('--rf-grid-cy', `${state.cursorY.toFixed(2)}px`);
  style.setProperty('--rf-grid-ex', `${state.elementX.toFixed(2)}px`);
  style.setProperty('--rf-grid-ey', `${state.elementY.toFixed(2)}px`);
  style.setProperty('--rf-grid-er', `${state.elementRadius.toFixed(2)}px`);
  style.setProperty('--rf-grid-c-strength', state.cursorStrength.toFixed(3));
  style.setProperty('--rf-grid-e-strength', state.elementStrength.toFixed(3));
  style.setProperty('--rf-grid-tilt-x', state.tiltX.toFixed(3));
  style.setProperty('--rf-grid-tilt-y', state.tiltY.toFixed(3));
};

export const useGridField = (containerRef: RefObject<HTMLElement | null>) => {
  const reducedMotion = useReducedMotion();
  const coarsePointer = useMediaQuery('(pointer: coarse)');
  const performanceTier = usePerformanceTier();
  const stateRef = useRef<GridFieldState>({enabled: false, ...createBaseVector()});

  const enabled = useMemo(() => {
    if (reducedMotion) return false;
    if (performanceTier === 'low') return false;
    if (coarsePointer && performanceTier !== 'high') return false;
    return true;
  }, [coarsePointer, performanceTier, reducedMotion]);

  useEffect(() => {
    const base = {enabled, ...createBaseVector()};
    stateRef.current = base;
    if (containerRef.current) {
      applyGridCssVariables(containerRef.current, base);
    }

    if (!enabled) {
      return;
    }

    const current = {...createBaseVector(), cursorStrength: DEFAULT_CURSOR_STRENGTH};
    const target = {...current};
    stateRef.current = {enabled: true, ...current};
    if (containerRef.current) {
      applyGridCssVariables(containerRef.current, stateRef.current);
    }

    const activeElementRef: {current: HTMLElement | null} = {current: null};
    const activeStrengthRef = {current: 0};
    const requestFrame = (callback: FrameRequestCallback) =>
      typeof window.requestAnimationFrame === 'function' ? window.requestAnimationFrame(callback) : window.setTimeout(() => callback(Date.now()), 16);
    const cancelFrame = (id: number) => {
      if (typeof window.cancelAnimationFrame === 'function') {
        window.cancelAnimationFrame(id);
        return;
      }
      window.clearTimeout(id);
    };

    let frameId: number | null = null;

    const updateElementTarget = () => {
      const activeElement = activeElementRef.current;
      if (!activeElement) {
        target.elementStrength = 0;
        return;
      }
      applyElementField(target, activeElement, activeStrengthRef.current);
    };

    const setActiveElement = (element: HTMLElement | null) => {
      if (!element) {
        activeElementRef.current = null;
        activeStrengthRef.current = 0;
        target.elementStrength = 0;
        return;
      }

      activeElementRef.current = element;
      activeStrengthRef.current = getInfluenceStrength(element);
      applyElementField(target, element, activeStrengthRef.current);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }

      target.cursorX = event.clientX;
      target.cursorY = event.clientY;
      target.cursorStrength = DEFAULT_CURSOR_STRENGTH;
      const width = Math.max(window.innerWidth, 1);
      const height = Math.max(window.innerHeight, 1);
      const normalizedX = clamp(event.clientX / width, 0, 1);
      const normalizedY = clamp(event.clientY / height, 0, 1);
      target.tiltX = (normalizedX - 0.5) * MAX_TILT * 2;
      target.tiltY = (normalizedY - 0.5) * MAX_TILT * -2;
    };

    const handlePointerOver = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }
      setActiveElement(resolveInfluenceTarget(event.target));
    };

    const handlePointerOut = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== 'mouse') {
        return;
      }

      const activeElement = activeElementRef.current;
      if (!activeElement) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      if (relatedTarget instanceof Node && activeElement.contains(relatedTarget)) {
        return;
      }
      setActiveElement(resolveInfluenceTarget(relatedTarget));
    };

    const handleFocusIn = (event: FocusEvent) => {
      setActiveElement(resolveInfluenceTarget(event.target));
    };

    const handleFocusOut = (event: FocusEvent) => {
      const activeElement = activeElementRef.current;
      if (!activeElement) {
        return;
      }

      const relatedTarget = event.relatedTarget;
      if (relatedTarget instanceof Node && activeElement.contains(relatedTarget)) {
        return;
      }
      setActiveElement(resolveInfluenceTarget(relatedTarget));
    };

    const handleWindowBlur = () => {
      target.cursorStrength = 0;
      target.tiltX = 0;
      target.tiltY = 0;
      setActiveElement(null);
    };

    const tick = () => {
      updateElementTarget();
      current.cursorX = lerp(current.cursorX, target.cursorX, LERP_FACTOR);
      current.cursorY = lerp(current.cursorY, target.cursorY, LERP_FACTOR);
      current.cursorStrength = lerp(current.cursorStrength, target.cursorStrength, LERP_FACTOR);
      current.elementX = lerp(current.elementX, target.elementX, LERP_FACTOR);
      current.elementY = lerp(current.elementY, target.elementY, LERP_FACTOR);
      current.elementRadius = lerp(current.elementRadius, target.elementRadius, LERP_FACTOR);
      current.elementStrength = lerp(current.elementStrength, target.elementStrength, LERP_FACTOR);
      current.tiltX = lerp(current.tiltX, target.tiltX, LERP_FACTOR);
      current.tiltY = lerp(current.tiltY, target.tiltY, LERP_FACTOR);

      stateRef.current = {enabled: true, ...current};
      if (containerRef.current) {
        applyGridCssVariables(containerRef.current, stateRef.current);
      }

      frameId = requestFrame(tick);
    };

    window.addEventListener('pointermove', handlePointerMove, {passive: true});
    window.addEventListener('pointerover', handlePointerOver, {passive: true});
    window.addEventListener('pointerout', handlePointerOut, {passive: true});
    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);
    window.addEventListener('blur', handleWindowBlur);

    frameId = requestFrame(tick);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('blur', handleWindowBlur);
      if (frameId !== null) {
        cancelFrame(frameId);
      }
    };
  }, [containerRef, enabled]);

  return {
    enabled,
    stateRef,
  };
};
