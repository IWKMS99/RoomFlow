export type CursorMode = 'default' | 'view' | 'book' | 'drag' | 'admin' | 'danger' | 'locked';
export type CursorSource = 'explicit' | 'heuristic' | 'default';

export interface CursorState {
  mode: CursorMode;
  text: string;
  source: CursorSource;
}

const MODES = new Set<CursorMode>(['default', 'view', 'book', 'drag', 'admin', 'danger', 'locked']);

const DRAG_SELECTOR = '[data-slot-index][data-room-id], [draggable="true"], [data-drag]';
const TEXT_SELECTOR = 'input, textarea, select, [contenteditable="true"]';
const ACTION_SELECTOR = 'button, a[href], [role="button"], summary, label';

const defaultState: CursorState = {mode: 'default', text: '', source: 'default'};

const parseMode = (value: string | undefined): CursorMode | null => {
  if (!value) {
    return null;
  }

  return MODES.has(value as CursorMode) ? (value as CursorMode) : null;
};

const isDisabledAction = (element: HTMLElement) =>
  element.matches(':disabled, [aria-disabled="true"]') ||
  element.getAttribute('disabled') !== null ||
  element.getAttribute('aria-disabled') === 'true';

const inferScopeMode = (element: HTMLElement): CursorMode | null => {
  const scope = element.closest<HTMLElement>('[data-cursor-scope]');
  const scopeMode = parseMode(scope?.dataset.cursorScope);
  return scopeMode;
};

export const getCursorFallbackText = (mode: CursorMode): string => {
  if (mode === 'book') return 'BOOK';
  if (mode === 'drag') return 'DRAG';
  if (mode === 'admin') return 'ADMIN';
  if (mode === 'danger') return 'CANCEL';
  if (mode === 'locked') return 'LOCK';
  if (mode === 'view') return 'OPEN';
  return '';
};

export const resolveCursorState = (target: EventTarget | null): CursorState => {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) {
    return defaultState;
  }

  const explicit = element.closest<HTMLElement>('[data-cursor]');
  if (explicit) {
    const explicitMode = parseMode(explicit.dataset.cursor) ?? 'default';
    return {
      mode: explicitMode,
      text: explicit.dataset.cursorText ?? '',
      source: 'explicit',
    };
  }

  const disabledAction = element.closest<HTMLElement>(ACTION_SELECTOR);
  if (disabledAction && isDisabledAction(disabledAction)) {
    return {mode: 'locked', text: '', source: 'heuristic'};
  }

  if (element.closest(TEXT_SELECTOR)) {
    return {mode: 'locked', text: '', source: 'heuristic'};
  }

  if (element.closest(DRAG_SELECTOR)) {
    return {mode: 'drag', text: 'DRAG', source: 'heuristic'};
  }

  const action = element.closest<HTMLElement>(ACTION_SELECTOR);
  if (action) {
    const scopedMode = inferScopeMode(action);
    if (scopedMode && scopedMode !== 'default') {
      return {mode: scopedMode, text: '', source: 'heuristic'};
    }

    return {mode: 'view', text: '', source: 'heuristic'};
  }

  return defaultState;
};
