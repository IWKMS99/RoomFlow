import React, {useEffect} from 'react';
import {Link, useLocation, useNavigate} from '@tanstack/react-router';
import {CalendarCheck2} from 'lucide-react';
import {useTranslation} from 'react-i18next';
import type {BookingResponse} from '../types/booking';
import NeonButton from '../components/ui/NeonButton';
import GlassCard from '../components/polish/GlassCard';

const formatConfirmationDate = (isoString: string, locale: string): string =>
  new Date(isoString).toLocaleDateString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

const formatConfirmationTime = (startIso: string, endIso: string, locale: string): string => {
  const startTime = new Date(startIso).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'});
  const endTime = new Date(endIso).toLocaleTimeString(locale, {hour: '2-digit', minute: '2-digit'});
  return `${startTime} - ${endTime}`;
};

const ConfirmationPage: React.FC = () => {
  const {i18n} = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const locale = i18n.language === 'ru' ? 'ru-RU' : 'en-US';

  const state = location.state as unknown as {bookingDetails: BookingResponse; roomName: string} | null;

  useEffect(() => {
    if (!state?.bookingDetails) {
      navigate({to: '/schedule', replace: true});
    }
  }, [state, navigate]);

  if (!state?.bookingDetails) {
    return <p className="text-sm text-muted-foreground">Проверка данных о бронировании...</p>;
  }

  const {bookingDetails, roomName} = state;

  return (
    <section className="mx-auto w-full max-w-lg pb-6">
      <GlassCard variant="hero" tone="accent" className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success/14 text-success rf-soft-beacon">
          <CalendarCheck2 size={26} />
        </div>

        <p className="rf-meta m-0 text-[11px] text-muted-foreground">Booking complete</p>
        <h1 className="rf-display m-0 mt-2 text-3xl font-bold">Бронирование подтверждено</h1>
        <p className="mb-0 mt-2 text-sm text-muted-foreground">Вы получите напоминание за 30 минут до начала.</p>

        <div className="my-6 space-y-2 rounded-2xl border border-white/14 bg-white/6 p-4 text-left">
          <p className="m-0 flex items-center justify-between text-sm text-muted-foreground">
            <span>Помещение</span>
            <strong className="text-foreground">{roomName}</strong>
          </p>
          <p className="m-0 flex items-center justify-between text-sm text-muted-foreground">
            <span>Дата</span>
            <strong className="text-foreground">{formatConfirmationDate(bookingDetails.startTime, locale)}</strong>
          </p>
          <p className="m-0 flex items-center justify-between text-sm text-muted-foreground">
            <span>Время</span>
            <strong className="rf-tabular text-foreground">
              {formatConfirmationTime(bookingDetails.startTime, bookingDetails.endTime, locale)}
            </strong>
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/schedule" className="flex-1">
            <NeonButton className="w-full" size="lg">
              Журнал занятости
            </NeonButton>
          </Link>
          <Link to="/my-bookings" className="flex-1">
            <NeonButton variant="secondary" className="w-full" size="lg">
              Мои брони
            </NeonButton>
          </Link>
        </div>
      </GlassCard>
    </section>
  );
};

export default ConfirmationPage;
