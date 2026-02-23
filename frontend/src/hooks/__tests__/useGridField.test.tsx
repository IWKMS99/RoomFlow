import {act, renderHook} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {useReducedMotion} from 'framer-motion';
import {useMediaQuery} from '../useMediaQuery';
import {usePerformanceTier} from '../usePerformanceTier';
import {useGridField} from '../useGridField';

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    useReducedMotion: vi.fn(),
  };
});

vi.mock('../useMediaQuery', () => ({
  useMediaQuery: vi.fn(),
}));

vi.mock('../usePerformanceTier', () => ({
  usePerformanceTier: vi.fn(),
}));

const mockedUseReducedMotion = vi.mocked(useReducedMotion);
const mockedUseMediaQuery = vi.mocked(useMediaQuery);
const mockedUsePerformanceTier = vi.mocked(usePerformanceTier);

const dispatchPointerEvent = (type: string, target: EventTarget, init: MouseEventInit = {}) => {
  const EventCtor = window.PointerEvent ?? window.MouseEvent;
  target.dispatchEvent(new EventCtor(type, {bubbles: true, ...init}));
};

describe('useGridField', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const requestFrame = (callback: FrameRequestCallback) => window.setTimeout(() => callback(Date.now()), 16);
    const cancelFrame = (id: number) => window.clearTimeout(id);
    vi.stubGlobal('requestAnimationFrame', requestFrame);
    vi.stubGlobal('cancelAnimationFrame', cancelFrame);
    Object.defineProperty(window, 'requestAnimationFrame', {value: requestFrame, writable: true, configurable: true});
    Object.defineProperty(window, 'cancelAnimationFrame', {value: cancelFrame, writable: true, configurable: true});

    mockedUseReducedMotion.mockReturnValue(false);
    mockedUseMediaQuery.mockReturnValue(false);
    mockedUsePerformanceTier.mockReturnValue('high');

    Object.defineProperty(window, 'innerWidth', {value: 1440, writable: true, configurable: true});
    Object.defineProperty(window, 'innerHeight', {value: 900, writable: true, configurable: true});
  });

  afterEach(() => {
    act(() => {
      vi.runOnlyPendingTimers();
      vi.clearAllTimers();
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('disables field when reduced motion is enabled', () => {
    mockedUseReducedMotion.mockReturnValue(true);
    const containerRef = {current: document.createElement('div')};
    const {result} = renderHook(() => useGridField(containerRef));

    expect(result.current.enabled).toBe(false);
    expect(result.current.stateRef.current.enabled).toBe(false);
    expect(result.current.stateRef.current.cursorStrength).toBe(0);
    expect(result.current.stateRef.current.elementStrength).toBe(0);
  });

  it('applies and clears element influence on focus transitions', () => {
    const button = document.createElement('button');
    button.textContent = 'Action';
    button.getBoundingClientRect = () =>
      ({
        left: 220,
        top: 160,
        width: 160,
        height: 48,
        right: 380,
        bottom: 208,
      }) as DOMRect;
    document.body.appendChild(button);

    const containerRef = {current: document.createElement('div')};
    const {result} = renderHook(() => useGridField(containerRef));

    act(() => {
      button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      vi.advanceTimersByTime(220);
    });

    expect(result.current.stateRef.current.elementStrength).toBeGreaterThan(0.4);
    expect(result.current.stateRef.current.elementRadius).toBeGreaterThan(90);

    act(() => {
      button.dispatchEvent(new FocusEvent('focusout', {bubbles: true, relatedTarget: document.body}));
      vi.advanceTimersByTime(400);
    });

    expect(result.current.stateRef.current.elementStrength).toBeLessThan(0.08);
  });

  it('ignores elements with data-grid-influence=off', () => {
    const button = document.createElement('button');
    button.dataset.gridInfluence = 'off';
    button.getBoundingClientRect = () =>
      ({
        left: 320,
        top: 200,
        width: 140,
        height: 44,
        right: 460,
        bottom: 244,
      }) as DOMRect;
    document.body.appendChild(button);

    const containerRef = {current: document.createElement('div')};
    const {result} = renderHook(() => useGridField(containerRef));

    act(() => {
      button.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
      vi.advanceTimersByTime(280);
    });

    expect(result.current.stateRef.current.elementStrength).toBeLessThan(0.02);
  });

  it('tracks cursor and then decays state after blur', () => {
    const containerRef = {current: document.createElement('div')};
    const {result} = renderHook(() => useGridField(containerRef));

    act(() => {
      dispatchPointerEvent('pointermove', window, {clientX: 1120, clientY: 160});
      vi.advanceTimersByTime(180);
    });

    expect(result.current.stateRef.current.cursorStrength).toBeGreaterThan(0.45);
    expect(Math.abs(result.current.stateRef.current.tiltX)).toBeGreaterThan(0.2);

    act(() => {
      window.dispatchEvent(new Event('blur'));
      vi.advanceTimersByTime(520);
    });

    expect(result.current.stateRef.current.cursorStrength).toBeLessThan(0.08);
    expect(Math.abs(result.current.stateRef.current.tiltX)).toBeLessThan(0.1);
    expect(Math.abs(result.current.stateRef.current.tiltY)).toBeLessThan(0.1);
  });
});
