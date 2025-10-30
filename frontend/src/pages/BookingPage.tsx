import React from 'react';
import {Link} from 'react-router-dom';
import styles from './BookingPage.module.css';

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
const rooms = [
    {name: 'Переговорка А', floor: 3, capacity: 6, tags: ['Проектор', 'Доска', 'ТВ'], available: true},
    {name: 'Переговорка Б', floor: 5, capacity: 10, tags: ['Доска'], available: false},
];

const BookingPage: React.FC = () => {
    // TODO: Добавить state для управления выбором
    const selectedTime = '10:00';
    const selectedRoom = 'Переговорка А';

    return (
        <div className={styles.pageContainer}>
            <Link to="/schedule" className={styles.backLink}>&lt; Новое бронирование</Link>

            <div className={styles.formSection}>
                <label>Дата</label>
                <input type="date" defaultValue="2025-10-15"/>
            </div>

            <div className={styles.formSection}>
                <label>Время (слоты по 1 часу)</label>
                <div className={styles.timeGrid}>
                    {timeSlots.map(time => (
                        <button key={time}
                                className={`${styles.timeButton} ${time === selectedTime ? styles.selected : ''}`}>
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.formSection}>
                <label>Доступные помещения</label>
                <div className={styles.roomsList}>
                    {rooms.map(room => (
                        <div key={room.name}
                             className={`${styles.roomCard} ${room.name === selectedRoom ? styles.selectedRoom : ''} ${!room.available ? styles.disabledRoom : ''}`}>
                            <div className={styles.roomDetails}>
                                <p className={styles.roomName}>{room.name}</p>
                                <p className={styles.roomMeta}>{`${room.capacity} мест • Этаж ${room.floor}`}</p>
                                <div className={styles.tags}>
                                    {room.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
                                </div>
                            </div>
                            <span
                                className={`${styles.statusTag} ${room.available ? styles.available : styles.booked}`}>
                                {room.available ? 'Свободно' : 'Занято'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <button className={styles.submitButton}>Забронировать</button>
        </div>
    );
};

export default BookingPage;