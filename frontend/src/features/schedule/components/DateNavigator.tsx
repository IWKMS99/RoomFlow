import React from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Calendar as CalendarIcon} from 'lucide-react';
import {DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {useTranslation} from 'react-i18next';
import {cn} from '../../../lib/utils';
import {formatDateForApi, normalizeDate} from '../../../lib/datetime/dateKey';
import {motionPreset} from '../../../lib/motion';

interface Props {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const DateNavigator = ({selectedDate, onSelect}: Props) => {
  const {i18n, t} = useTranslation();
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Закрытие по клику вне календаря
  React.useEffect(() => {
    if (!isCalendarOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsCalendarOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isCalendarOpen]);

  // Умная лента дат
  const quickDates = React.useMemo(() => {
    const today = normalizeDate(new Date());
    const dates: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      dates.push(next);
    }

    const isSelectedInQuickDates = dates.some(
      (date) => formatDateForApi(date) === formatDateForApi(selectedDate)
    );

    if (!isSelectedInQuickDates && selectedDate >= today) {
      dates.push(selectedDate);
    }

    return dates;
  }, [selectedDate]);

  const isSelected = React.useCallback(
    (date: Date) => formatDateForApi(date) === formatDateForApi(selectedDate),
    [selectedDate]
  );

  return (
    <div className="relative flex w-full flex-col sm:w-auto sm:items-end" ref={containerRef}>
      <style>{`
        .rf-day-picker {
          --rdp-cell-size: 42px;
          --rdp-accent-color: transparent;
          --rdp-background-color: transparent;
          margin: 0;
        }

        .rf-day-picker .rdp-nav {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rf-day-picker .rdp-button_previous, 
        .rf-day-picker .rdp-button_next {
          width: 32px !important;
          height: 32px !important;
          border-radius: 10px !important;
          border: 1px solid hsl(var(--text-hi) / 0.1) !important;
          background: transparent !important;
          color: hsl(var(--text-hi)) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0 !important;
          cursor: pointer !important;
          transition: all 0.2s ease !important;
        }

        .rf-day-picker .rdp-button_previous:hover, 
        .rf-day-picker .rdp-button_next:hover {
          background: hsl(var(--bg-1) / 0.5) !important;
          border-color: hsl(var(--primary) / 0.5) !important;
        }

        .rf-day-picker .rdp-nav svg {
          width: 18px !important;
          height: 18px !important;
          opacity: 1 !important;
          fill: currentColor !important;
        }

        .rf-day-picker .rdp-day {
          background: transparent !important;
        }

        .rf-day-picker .rdp-day_button {
          border-radius: 50% !important;
          transition: all 0.2s ease;
          background-color: transparent;
          border: 2px solid transparent !important;
        }

        .rf-day-picker .rdp-day_button:hover:not(.rdp-selected .rdp-day_button) {
          background-color: hsl(var(--bg-1) / 0.4) !important;
        }

        .rf-day-picker .rdp-selected .rdp-day_button {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          box-shadow: 0 4px 14px hsl(var(--primary) / 0.4) !important;
          font-weight: bold !important;
        }

        .rf-day-picker .rdp-today .rdp-day_button {
          color: hsl(var(--primary)) !important;
          font-weight: bold !important;
          border: 1.5px solid hsl(var(--primary) / 0.3) !important;
        }

        .rf-day-picker .rdp-selected.rdp-today .rdp-day_button {
          color: hsl(var(--primary-foreground)) !important;
          border-color: hsl(var(--primary-foreground) / 0.35) !important;
        }

        .rf-day-picker .rdp-month_caption {
          font-weight: 700 !important;
          font-size: 1.05rem !important;
          color: hsl(var(--text-hi)) !important;
          text-transform: capitalize;
          margin-bottom: 0.75rem !important;
        }

        .rf-day-picker .rdp-weekday {
          font-size: 0.65rem !important;
          font-weight: 700 !important;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: hsl(var(--text-dim)) !important;
          padding-bottom: 0.5rem !important;
        }
      `}</style>

      {/* Островок навигации */}
      <div className="rf-control-cluster flex w-full max-w-full items-center rounded-3xl p-1.5 shadow-lg sm:w-max">
        
        <button
          type="button"
          onClick={() => setIsCalendarOpen((current) => !current)}
          className={cn(
            'group flex shrink-0 items-center gap-2.5 rounded-2xl px-3 py-2 transition-colors',
            isCalendarOpen ? 'bg-white/10' : 'hover:bg-white/5'
          )}
          aria-label={t('schedule.dateNavigator.openCalendarAria')}
          aria-expanded={isCalendarOpen}
        >
          <div
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
              isCalendarOpen
                ? 'bg-primary text-primary-foreground shadow-[0_4px_12px_hsl(var(--primary)/0.4)]'
                : 'bg-primary/15 text-primary group-hover:bg-primary/25'
            )}
          >
            <CalendarIcon size={18} />
          </div>
          <div className="hidden flex-col items-start leading-none sm:flex">
            <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {selectedDate.getFullYear()}
            </span>
            <span className="text-sm font-bold capitalize text-foreground">
              {selectedDate.toLocaleDateString(locale, {month: 'long'})}
            </span>
          </div>
        </button>

        <div className="mx-1 h-8 w-px shrink-0 bg-white/10 sm:mx-2" />

        {/* Лента дней */}
        <div className="no-scrollbar flex flex-1 scroll-smooth items-center gap-1 overflow-x-auto pr-1 sm:flex-none">
          {quickDates.map((date, index) => {
            const active = isSelected(date);
            const isGap = index === 7;
            return (
              <React.Fragment key={formatDateForApi(date)}>
                {isGap && <div className="mx-1 h-1 w-1 shrink-0 rounded-full bg-white/20" />}
                <button
                  type="button"
                  onClick={() => {
                    onSelect(date);
                    setIsCalendarOpen(false);
                  }}
                  className={cn(
                    'relative flex h-[50px] w-[46px] shrink-0 flex-col items-center justify-center rounded-2xl transition-colors',
                    active
                      ? 'text-primary-foreground'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-2xl bg-primary shadow-[0_8px_16px_-6px_hsl(var(--primary)/0.6)]"
                      transition={motionPreset.spring}
                    />
                  )}
                  <span className="relative z-base mb-0.5 text-[9px] font-bold uppercase tracking-wide opacity-75">
                    {date.toLocaleDateString(locale, {weekday: 'short'})}
                  </span>
                  <span className="relative z-base text-[15px] font-bold leading-none">
                    {date.getDate()}
                  </span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Поп-ап с календарем */}
      <AnimatePresence>
        {isCalendarOpen && (
          <motion.div
            initial={{opacity: 0, y: 10, scale: 0.96}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: 10, scale: 0.96}}
            transition={motionPreset.springGentle}
            // Выровнено строго по правому краю контейнера (right-0 origin-top-right)
            className="rf-modal absolute right-0 top-[calc(100%+12px)] z-popover w-max max-w-[calc(100vw-2rem)] origin-top-right rounded-[2rem] p-4 shadow-2xl sm:p-5"
          >
            {/* Полностью очистили classNames, полагаемся на нативную верстку + наш CSS блок */}
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (!date) return;
                onSelect(normalizeDate(date));
                setIsCalendarOpen(false);
              }}
              disabled={{before: normalizeDate(new Date())}}
              className="rf-day-picker text-foreground"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateNavigator;
