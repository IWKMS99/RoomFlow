import React, {useEffect, useMemo, useState} from 'react';
import styles from './MyBookingsPage.module.css';
import {cancelBooking, getMyBookings} from '../services/api';
import type {BookingResponse, BookingStatus} from '../types/booking';
import BookingCardSkeleton from "../components/BookingCardSkeleton.tsx";
import toast from "react-hot-toast";

const formatBookingDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatBookingTime = (startIso: string, endIso: string): string => {
    const startTime = new Date(startIso).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    const endTime = new Date(endIso).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    return `${startTime}-${endTime}`;
};

const statusMap: Record<BookingStatus, { text: string; className: string }> = {
    CONFIRMED: {text: 'Активно', className: styles.активно},
    REQUESTED: {text: 'Ожидает', className: styles.ожидает},
    COMPLETED: {text: 'Завершено', className: styles.завершено},
    CANCELLED: {text: 'Отменено', className: styles.отменено},
};


const MyBookingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadBookings = async () => {
            try {
                setIsLoading(true);
                const data = await getMyBookings();
                data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setBookings(data);
            } catch (err) {
                console.error("Failed to fetch bookings:", err);
                setError("Не удалось загрузить список бронирований.");
            } finally {
                setIsLoading(false);
            }
        };
        loadBookings();
    }, []);

    const handleCancelBooking = async (bookingId: string) => {
        const promise = cancelBooking(bookingId);

        toast.promise(
            promise,
            {
                loading: 'Отменяем бронирование...',
                success: () => {
                    setBookings(prevBookings =>
                        prevBookings.map(b =>
                            b.id === bookingId ? {...b, status: 'CANCELLED'} : b
                        )
                    );
                    return 'Бронирование успешно отменено!';
                },
                error: (err) => {
                    console.error("Failed to cancel booking:", err);
                    return err.response?.data?.message || "Не удалось отменить бронирование.";
                },
            }
        );
    };

    const {activeBookings, historyBookings} = useMemo(() => {
        const now = new Date();
        const active: BookingResponse[] = [];
        const history: BookingResponse[] = [];

        bookings.forEach(b => {
            const isPast = new Date(b.endTime) < now;
            if (b.status === 'CONFIRMED' && !isPast) {
                active.push(b);
            } else {
                history.push(b);
            }
        });

        return {activeBookings: active, historyBookings: history};
    }, [bookings]);

    const renderBookingCard = (booking: BookingResponse) => {
        const displayStatus = statusMap[booking.status] || {text: booking.status, className: ''};
        const isCancellable = booking.status === 'CONFIRMED' && new Date(booking.startTime) > new Date();

        return (
            <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.cardTop}>
                    <div>
                        <p className={styles.roomName}>{booking.roomName}</p>
                        <p className={styles.roomMeta}>{booking.capacity} мест • Этаж {booking.floor}</p>
                        <p className={styles.dateTime}>
                            {formatBookingDate(booking.startTime)} • {formatBookingTime(booking.startTime, booking.endTime)}
                        </p>
                    </div>
                    <div className={`${styles.statusBadge} ${displayStatus.className}`}>
                        {displayStatus.text}
                    </div>
                </div>
                {isCancellable && (
                    <div className={styles.cardActions}>
                        <button className={`${styles.actionButton} ${styles.cancelButton}`}
                                onClick={() => handleCancelBooking(booking.id)}>
                            Отменить
                        </button>
                    </div>
                )}
            </div>
        );
    };

    const displayedBookings = activeTab === 'active' ? activeBookings : historyBookings;

    return (
        <div className={styles.pageContainer}>
            <h1>Мои бронирования</h1>
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'active' ? styles.active : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    Активные ({activeBookings.length})
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    История ({historyBookings.length})
                </button>
            </div>

            <div className={styles.bookingsList}>
                {isLoading ? (
                    <>
                        <BookingCardSkeleton />
                        <BookingCardSkeleton />
                        <BookingCardSkeleton />
                    </>
                ) : (
                    <>
                        {error && <p style={{ color: 'var(--red-cancel)' }}>{error}</p>}
                        {!error && displayedBookings.length === 0 && (
                            <p>У вас нет {activeTab === 'active' ? 'активных бронирований' : 'бронирований в истории'}.</p>
                        )}
                        {!error && displayedBookings.map(renderBookingCard)}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyBookingsPage;