import React from 'react';
import styles from './MyBookingsPage.module.css';

const myBookings = [
    { id: 'b1', roomName: 'Переговорка А', dateTime: '15.10.2025 • 14:00-16:00', status: 'Активно', isCancellable: true },
    { id: 'b2', roomName: 'Переговорка Б', dateTime: '16.10.2025 • 10:00-12:00', status: 'Отменено', isCancellable: false },
    { id: 'b3', roomName: 'Переговорка Б', dateTime: '15.10.2025 • 15:00-17:00', status: 'Завершено', isCancellable: false },
];

const MyBookingsPage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <h1>Мои бронирования</h1>
            <div className={styles.tabs}>
                <button className={`${styles.tab} ${styles.active}`}>Активные (1)</button>
                <button className={styles.tab}>История</button>
            </div>
            <div className={styles.bookingsList}>
                {myBookings.map(booking => (
                    <div key={booking.id} className={styles.bookingCard}>
                        <div className={styles.cardMain}>
                            <div className={styles.cardInfo}>
                                <p className={styles.roomName}>{booking.roomName}</p>
                                <p className={styles.dateTime}>{booking.dateTime}</p>
                            </div>
                            <div className={`${styles.statusBadge} ${styles[booking.status.toLowerCase()]}`}>{booking.status}</div>
                        </div>
                        {booking.isCancellable && (
                            <div className={styles.cardActions}>
                                <button className={styles.detailsButton}>Детали</button>
                                <button className={styles.cancelButton}>Отменить</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MyBookingsPage;