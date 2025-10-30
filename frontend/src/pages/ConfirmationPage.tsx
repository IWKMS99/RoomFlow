import React, {useEffect} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import styles from './ConfirmationPage.module.css';
import type {BookingResponse} from '../types/booking';

const formatConfirmationDate = (isoString: string): string => {
    return new Date(isoString).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const formatConfirmationTime = (startIso: string, endIso: string): string => {
    const startTime = new Date(startIso).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    const endTime = new Date(endIso).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit'});
    return `${startTime} - ${endTime}`;
};

const SuccessIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="#28a745"/>
    </svg>
);

const ConfirmationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const state = location.state as { bookingDetails: BookingResponse; roomName: string } | null;

    useEffect(() => {
        if (!state?.bookingDetails) {
            console.warn("Confirmation page accessed without booking details. Redirecting.");
            navigate('/schedule', {replace: true});
        }
    }, [state, navigate]);

    if (!state?.bookingDetails) {
        return <p>Проверка данных о бронировании...</p>;
    }

    const {bookingDetails, roomName} = state;

    return (
        <div className={styles.pageContainer}>
            <div className={styles.card}>
                <div className={styles.iconWrapper}><SuccessIcon/></div>

                <h1 className={styles.title}>Бронирование подтверждено!</h1>

                <p className={styles.subtitle}>Вы получите напоминание за 30 минут до начала.</p>

                <div className={styles.details}>
                    <div className={styles.detailItem}>
                        <span>Помещение:</span>
                        <strong>{roomName}</strong>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Дата:</span>
                        <strong>{formatConfirmationDate(bookingDetails.startTime)}</strong>
                    </div>
                    <div className={styles.detailItem}>
                        <span>Время:</span>
                        <strong>{formatConfirmationTime(bookingDetails.startTime, bookingDetails.endTime)}</strong>
                    </div>
                </div>

                <div className={styles.actions}>
                    <Link to="/schedule" className={`${styles.button} ${styles.primary}`}>Журнал занятости</Link>
                    <Link to="/my-bookings" className={`${styles.button} ${styles.secondary}`}>Мои брони</Link>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationPage;