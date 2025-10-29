import React from 'react';
import styles from './SchedulePage.module.css';

const mockData = [
    {
        time: '09:00 - 10:00',
        rooms: [
            {name: 'Переговорка А', floor: 3, capacity: 6, available: true},
            {name: 'Переговорка Б', floor: 5, capacity: 10, available: true},
        ],
    },
    {
        time: '10:00 - 11:00',
        rooms: [
            {name: 'Переговорка А', floor: 3, capacity: 6, available: true},
            {name: 'Переговорка Б', floor: 5, capacity: 10, available: false},
        ],
    },
    {
        time: '11:00 - 12:00',
        rooms: [
            {name: 'Переговорка А', floor: 3, capacity: 6, available: false},
            {name: 'Переговорка Б', floor: 5, capacity: 10, available: false},
        ],
    },
];

const SchedulePage: React.FC = () => {
    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>Журнал занятости</h1>
                <div className={styles.dateSelector}>
                    <button>&lt;</button>
                    <span>15 октября 2025</span>
                    <button>&gt;</button>
                </div>
            </header>

            <div className={styles.timeSlotsContainer}>
                {mockData.map((slot) => (
                    <div key={slot.time} className={styles.timeSlot}>
                        <div className={styles.timeLabel}>{slot.time}</div>
                        <div className={styles.roomsList}>
                            {slot.rooms.map((room) => (
                                <div key={room.name} className={styles.roomCard}>
                                    <div className={styles.roomInfo}>
                                        <span
                                            className={`${styles.statusIndicator} ${room.available ? styles.available : styles.booked}`}></span>
                                        <div>
                                            <p className={styles.roomName}>{room.name}</p>
                                            <p className={styles.roomMeta}>{`${room.capacity} мест • Этаж ${room.floor}`}</p>
                                        </div>
                                    </div>
                                    <button disabled={!room.available} className={styles.bookButton}>
                                        Забронировать
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SchedulePage;