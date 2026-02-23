import React from 'react';
import {Link} from 'react-router-dom';
import {useMyBookingsQuery} from '../services/hooks/useMyBookingsQuery';
import {useAuth} from '../context/useAuth';

const MyBookingsPage: React.FC = () => {
  const {isAuthenticated} = useAuth();
  const bookings = useMyBookingsQuery(isAuthenticated);

  return (
    <section className="mx-auto max-w-4xl space-y-4 pb-8">
      <h1 className="rf-display text-3xl font-bold">Мои бронирования</h1>
      <p className="text-sm text-muted-foreground">
        Этот экран временно работает в fallback-режиме. Spatial-версия будет в следующей итерации.
      </p>

      {bookings.isLoading && <p className="text-sm text-muted-foreground">Загрузка...</p>}
      {bookings.isError && (
        <p className="text-sm text-danger">
          Не удалось загрузить данные. <button type="button" className="underline" onClick={() => void bookings.refetch()}>Повторить</button>
        </p>
      )}

      {!bookings.isLoading && !bookings.isError && (bookings.data ?? []).length === 0 && (
        <p className="text-sm text-muted-foreground">Активных бронирований нет.</p>
      )}

      {!bookings.isLoading && !bookings.isError && (bookings.data ?? []).length > 0 && (
        <div className="grid gap-3 md:grid-cols-2">
          {(bookings.data ?? []).map((booking) => (
            <article key={booking.id} className="rounded-xl border border-white/16 bg-card/70 p-4">
              <p className="m-0 text-base font-semibold text-foreground">{booking.roomName}</p>
              <p className="m-0 mt-1 text-sm text-muted-foreground">
                {new Date(booking.startTime).toLocaleDateString('ru-RU')} • {new Date(booking.startTime).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'})}
              </p>
              <p className="m-0 mt-1 text-xs text-muted-foreground">Статус: {booking.status}</p>
            </article>
          ))}
        </div>
      )}

      <Link to="/schedule" className="text-sm text-primary underline">Вернуться в Spatial Schedule</Link>
    </section>
  );
};

export default MyBookingsPage;
