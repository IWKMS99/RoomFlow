import React from 'react';
import {ChevronDown, ChevronUp} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import {cn} from '../../lib/utils';

interface NumberStepperInputProps {
  value: number | undefined;
  onValueChange: (next: number | undefined) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
}

const toBoundedValue = (value: number, min?: number, max?: number) => {
  let next = value;
  if (typeof min === 'number') {
    next = Math.max(min, next);
  }
  if (typeof max === 'number') {
    next = Math.min(max, next);
  }
  return next;
};

const NumberStepperInput = ({
  value,
  onValueChange,
  min,
  max,
  step = 1,
  placeholder,
  className,
  inputClassName,
  disabled = false,
}: NumberStepperInputProps) => {
  const {t} = useTranslation();
  const [draft, setDraft] = React.useState<string>(value == null ? '' : String(value));

  React.useEffect(() => {
    setDraft(value == null ? '' : String(value));
  }, [value]);

  const applyNext = React.useCallback(
    (next: number | undefined) => {
      if (typeof next !== 'number' || Number.isNaN(next)) {
        onValueChange(undefined);
        return;
      }
      onValueChange(toBoundedValue(next, min, max));
    },
    [max, min, onValueChange]
  );

  const increment = () => {
    if (disabled) return;
    const base = typeof value === 'number' ? value : min ?? 0;
    applyNext(base + step);
  };

  const decrement = () => {
    if (disabled) return;
    if (typeof value !== 'number') {
      return;
    }
    const candidate = value - step;
    if (typeof min === 'number' && candidate < min) {
      applyNext(min);
      return;
    }
    applyNext(candidate);
  };

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const raw = event.target.value;
    if (/^\d*$/.test(raw)) {
      setDraft(raw);
      if (raw === '') {
        onValueChange(undefined);
        return;
      }
      applyNext(Number(raw));
    }
  };

  return (
    <div
      className={cn(
        'flex items-stretch overflow-hidden rounded-lg border border-white/16 bg-background/40',
        disabled && 'opacity-60',
        className
      )}
    >
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        onChange={onInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn('w-full border-0 bg-transparent px-3 py-2 text-xs text-foreground outline-none', inputClassName)}
      />
      <div className="flex w-8 flex-col border-l border-white/14">
        <button
          type="button"
          onClick={increment}
          disabled={disabled}
          className="flex h-1/2 items-center justify-center text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          aria-label={t('common.increaseValue')}
        >
          <ChevronUp size={13} />
        </button>
        <button
          type="button"
          onClick={decrement}
          disabled={disabled}
          className="flex h-1/2 items-center justify-center border-t border-white/14 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
          aria-label={t('common.decreaseValue')}
        >
          <ChevronDown size={13} />
        </button>
      </div>
    </div>
  );
};

export default NumberStepperInput;
