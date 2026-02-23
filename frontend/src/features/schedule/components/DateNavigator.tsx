import React from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'framer-motion';
import {Calendar as CalendarIcon, X} from 'lucide-react';
import {DayPicker} from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import {useTranslation} from 'react-i18next';
import {cn} from '../../../lib/utils';
import {formatDateForApi, normalizeDate} from '../../../lib/datetime/dateKey';
import {motionTokens} from '../../../lib/motionTokens';

interface Props {
  selectedDate: Date;
  onSelect: (date: Date) => void;
}

const DateNavigator = ({selectedDate, onSelect}: Props) => {
  const {i18n, t} = useTranslation();
  const reducedMotion = useReducedMotion();
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const closeCalendar = React.useCallback(() => {
    setIsCalendarOpen(false);
  }, []);

  React.useEffect(() => {
    if (!isCalendarOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (target instanceof Node && !containerRef.current?.contains(target)) {
        closeCalendar();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeCalendar();
      }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeCalendar, isCalendarOpen]);

  const quickDates = React.useMemo(() => {
    const today = normalizeDate(new Date());
    const dates: Date[] = [];
    for (let i = 0; i < 7; i += 1) {
      const next = new Date(today);
      next.setDate(today.getDate() + i);
      dates.push(next);
    }
    return dates;
  }, []);

  const isSelected = (date: Date) => formatDateForApi(date) === formatDateForApi(selectedDate);

  return (
    <div className="relative flex w-full flex-col sm:w-auto sm:items-end" ref={containerRef}>
      <style>{`
        .rf-day-picker { --rdp-cell-size: 42px; margin: 0; }
        .rf-day-picker .rdp-day_button { border-radius: 50% !important; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .rf-day-picker .rdp-selected .rdp-day_button { background-color: hsl(var(--primary)) !important; color: hsl(var(--primary-foreground)) !important; }
      `}</style>

      <motion.div
        layout
        transition={motionTokens.card}
        className="rf-control-cluster flex w-full max-w-full items-center rounded-[2rem] p-1.5 shadow-lg backdrop-blur-2xl sm:w-max"
      >
        <button
          type="button"
          onClick={() => setIsCalendarOpen((open) => !open)}
          className={cn(
            'group relative flex h-[50px] w-[50px] shrink-0 items-center gap-2.5 overflow-hidden px-3 py-2 outline-none transition sm:w-[170px]',
            isCalendarOpen ? 'bg-primary/12 text-foreground' : 'text-foreground hover:bg-white/8'
          )}
          style={{borderRadius: 24}}
          aria-haspopup="dialog"
          aria-expanded={isCalendarOpen}
          aria-label={t('schedule.dateNavigator.openCalendarAria')}
        >
          <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-[14px] bg-primary/15 text-primary">
            <CalendarIcon size={18} />
          </span>
          <span className="relative z-10 hidden shrink-0 flex-col items-start leading-none sm:flex">
            <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {selectedDate.getFullYear()}
            </span>
            <span className="text-sm font-bold capitalize text-foreground">
              {selectedDate.toLocaleDateString(locale, {month: 'long'})}
            </span>
          </span>
        </button>

        <motion.div
          layout
          className="mx-1 h-8 w-px shrink-0 bg-white/10 sm:mx-2"
          transition={motionTokens.card}
        />

        <motion.div
          layout
          className="no-scrollbar flex flex-1 scroll-smooth items-center gap-1 overflow-x-auto pr-1 sm:flex-none"
          transition={motionTokens.card}
        >
          {quickDates.map((date) => {
            const active = isSelected(date);
            return (
              <motion.button
                layout
                key={formatDateForApi(date)}
                whileHover={reducedMotion || active ? {} : {y: -2}}
                whileTap={reducedMotion ? {} : {scale: 0.85}}
                onClick={() => onSelect(date)}
                className={cn(
                  'relative flex h-[50px] w-[46px] shrink-0 flex-col items-center justify-center rounded-[1.15rem]',
                  active ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
                transition={motionTokens.card}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-[1.15rem] bg-primary shadow-lg"
                    transition={motionTokens.control}
                  />
                )}
                <span className="relative z-base mb-0.5 text-[9px] font-bold uppercase opacity-75">
                  {date.toLocaleDateString(locale, {weekday: 'short'})}
                </span>
                <span className="relative z-base text-[15px] font-bold">{date.getDate()}</span>
              </motion.button>
            );
          })}
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false} mode="wait">
        {isCalendarOpen && (
          <motion.div
            key="calendar-popover"
            initial={reducedMotion ? false : {opacity: 0, y: -6, scale: 0.98}}
            animate={reducedMotion ? undefined : {opacity: 1, y: 0, scale: 1}}
            exit={reducedMotion ? undefined : {opacity: 0, y: -4, scale: 0.98}}
            transition={reducedMotion ? motionTokens.control : {duration: 0.16}}
            className="absolute right-0 top-[calc(100%+12px)] z-popover w-full origin-top-right sm:w-[360px]"
            style={{borderRadius: 32}}
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/20 p-4 shadow-glow backdrop-blur-2xl sm:p-5">
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(140deg,hsl(var(--surface-glass-1)),hsl(var(--surface-glass-2)))]" />
              <div className="relative z-10 mb-4 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-primary text-primary-foreground shadow-lg">
                  <CalendarIcon size={20} />
                </div>
                <div className="flex flex-col items-start leading-none">
                  <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {selectedDate.getFullYear()}
                  </span>
                  <span className="text-base font-bold capitalize text-foreground">
                    {selectedDate.toLocaleDateString(locale, {month: 'long'})}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCalendar}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-muted-foreground hover:bg-white/10"
                aria-label={t('cursor.close')}
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative z-10">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (!date) return;
                  onSelect(normalizeDate(date));
                  closeCalendar();
                }}
                disabled={{before: normalizeDate(new Date())}}
                className="rf-day-picker text-foreground"
              />
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DateNavigator;
