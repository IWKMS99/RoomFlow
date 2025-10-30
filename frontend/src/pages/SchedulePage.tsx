import React, {useEffect, useState} from 'react';
import styles from './SchedulePage.module.css';
import {fetchSchedule} from '../services/api';
import type {ScheduleView} from '../types/booking';
import SchedulePageSkeleton from "../components/SchedulePageSkeleton.tsx";

const formatDateForApi = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};


const SchedulePage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [schedule, setSchedule] = useState<ScheduleView | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSchedule = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const dateString = formatDateForApi(selectedDate);
                const data = await fetchSchedule(dateString);
                setSchedule(data);
            } catch (err) {
                console.error("Failed to fetch schedule:", err);
                setError("Не удалось загрузить расписание. Пожалуйста, попробуйте обновить страницу.");
            } finally {
                setIsLoading(false);
            }
        };

        loadSchedule();
    }, [selectedDate]);

    const handlePrevDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() - 1);
        setSelectedDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + 1);
        setSelectedDate(newDate);
    };

    const renderContent = () => {
        if (isLoading) {
            return <SchedulePageSkeleton />;
        }
        if (error) {
            return <p style={{color: 'var(--red-cancel)'}}>{error}</p>;
        }
        if (!schedule || schedule.timeSlots.length === 0) {
            return <p>На выбранную дату нет доступных слотов.</p>;
        }
        return (
            <div className={styles.timeSlotsContainer}>
                {schedule.timeSlots.map((slot) => {
                    const nextHour = parseInt(slot.time.split(':')[0]) + 1;
                    return (
                        <div key={slot.time} className={styles.timeSlot}>
                            <div
                                className={styles.timeLabel}>{`${slot.time.substring(0, 5)} - ${nextHour.toString().padStart(2, '0')}:00`}</div>
                            <div className={styles.roomsList}>
                                {slot.rooms.map((room) => (
                                    <div key={room.roomId}
                                         className={`${styles.roomCard} ${room.isAvailable ? styles.available : styles.booked}`}>
                                        <div className={styles.roomInfo}>
                                            <span className={styles.statusIndicator}></span>
                                            <div>
                                                <p className={styles.roomName}>{room.roomName}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={styles.pageContainer}>
            <header className={styles.pageHeader}>
                <h1>Журнал занятости</h1>
                <div className={styles.dateSelector}>
                    <button onClick={handlePrevDay}>&lt;</button>
                    <span>{formatDateForDisplay(selectedDate)}</span>
                    <button onClick={handleNextDay}>&gt;</button>
                </div>
            </header>

            {renderContent()}
        </div>
    );
};

export default SchedulePage;