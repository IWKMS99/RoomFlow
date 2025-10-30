import React from 'react';
import {Link} from 'react-router-dom';
import styles from './ConfirmationPage.module.css';

const SuccessIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="#28a745"/>
    </svg>
);

const ConfirmationPage: React.FC = () => {
    // Mock data
    const bookingDetails = {
        room: 'Переговорка А',
        date: '15.10.2025',
        time: '14:00 - 15:00',
    };

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}><SuccessIcon/></div>

                <h1 className={styles.title}>Бронирование подтверждено!</h1>

                <p className={styles.subtitle}>Вы получите напоминание за 30 минут до начала.</p>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span>Помещение:</span>
                        <strong>{bookingDetails.room}</strong>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Дата:</span>
                        <strong>{bookingDetails.date}</strong>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Время:</span>
                        <strong>{bookingDetails.time}</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link to="/" className={`${styles.button} ${styles.primary}`}>На главную</Link>
                    <Link to="/my-bookings" className={`${styles.button} ${styles.secondary}`}>Мои брони</Link>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;