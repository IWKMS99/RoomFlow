import React, {useEffect, useMemo, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import styles from './BookingPage.module.css';
import {createBooking, fetchSchedule} from '../services/api';
import type {ScheduleView} from '../types/booking';

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

const BookingPage: React.FC = () => {
    const navigate = useNavigate();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

    const [schedule, setSchedule] = useState<ScheduleView | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadSchedule = async () => {
            setIsLoading(true);
            setError(null);
            setSelectedTime(null);
            setSelectedRoomId(null);
            try {
                const dateString = formatDateForInput(selectedDate);
                const data = await fetchSchedule(dateString);
                setSchedule(data);
            } catch (err) {
                console.error("Failed to fetch schedule:", err);
                setError("Не удалось загрузить доступные слоты.");
            } finally {
                setIsLoading(false);
            }
        };
        loadSchedule();
    }, [selectedDate]);

    const roomAvailability = useMemo(() => {
        if (!selectedTime || !schedule) {
            return new Map<string, boolean>();
        }
        const timeSlot = schedule.timeSlots.find(slot => slot.time.startsWith(selectedTime));
        const availabilityMap = new Map<string, boolean>();
        timeSlot?.rooms.forEach(room => {
            availabilityMap.set(room.roomId, room.isAvailable);
        });
        return availabilityMap;
    }, [selectedTime, schedule]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(new Date(e.target.value + 'T00:00:00'));
    };

    const handleTimeSelect = (time: string) => {
        setSelectedTime(time);
        setSelectedRoomId(null);
    };

    const handleRoomSelect = (roomId: string, isAvailable: boolean) => {
        if (isAvailable) {
            setSelectedRoomId(roomId);
        }
    };

    const handleSubmit = async () => {
        if (!selectedTime || !selectedRoomId) {
            alert("Пожалуйста, выберите время и помещение.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const [hour, minute] = selectedTime.split(':').map(Number);
            const startTime = new Date(selectedDate);
            startTime.setHours(hour, minute, 0, 0);

            const endTime = new Date(startTime);
            endTime.setHours(startTime.getHours() + 1);

            const payload = {
                roomId: selectedRoomId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            };

            const response = await createBooking(payload);

            const selectedRoom = allRooms.find(r => r.roomId === selectedRoomId);
            const roomName = selectedRoom ? selectedRoom.roomName : 'Неизвестная комната';

            navigate('/booking/confirmed', {
                state: {
                    bookingDetails: response,
                    roomName: roomName
                }
            });

        } catch (err: any) {
            console.error("Failed to create booking:", err);
            if (err.response?.status === 409) {
                setError("К сожалению, эта комната уже занята. Пожалуйста, выберите другое время.");
            } else {
                setError("Произошла ошибка при бронировании.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const allRooms = schedule?.timeSlots[0]?.rooms || [];

    return (
        <div className={styles.pageContainer}>
            <Link to="/schedule" className={styles.backLink}>&lt; Новое бронирование</Link>

            <div className={styles.formSection}>
                <label>Дата</label>
                <input type="date" value={formatDateForInput(selectedDate)} onChange={handleDateChange}/>
            </div>

            <div className={styles.formSection}>
                <label>Время (слоты по 1 часу)</label>
                <div className={styles.timeGrid}>
                    {timeSlots.map(time => (
                        <button key={time}
                                className={`${styles.timeButton} ${time === selectedTime ? styles.selected : ''}`}
                                onClick={() => handleTimeSelect(time)}>
                            {time}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.formSection}>
                <label>Доступные помещения</label>
                {isLoading && <p>Загрузка помещений...</p>}
                {!isLoading && error && <p style={{color: 'var(--red-cancel)'}}>{error}</p>}
                {!isLoading && selectedTime && (
                    <div className={styles.roomsList}>
                        {allRooms.map(room => {
                            const isAvailable = roomAvailability.get(room.roomId) ?? false;
                            return (
                                <div key={room.roomId}
                                     onClick={() => handleRoomSelect(room.roomId, isAvailable)}
                                     className={`${styles.roomCard} 
                                       ${room.roomId === selectedRoomId ? styles.selectedRoom : ''} 
                                       ${!isAvailable ? styles.disabledRoom : ''}`}>
                                    <div className={styles.roomDetails}>
                                        <p className={styles.roomName}>{room.roomName}</p>
                                        {/* TODO: Добавить мета-информацию о комнате */}
                                    </div>
                                    <span
                                        className={`${styles.statusTag} ${isAvailable ? styles.available : styles.booked}`}>
                                {isAvailable ? 'Свободно' : 'Занято'}
                              </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <button className={styles.submitButton} onClick={handleSubmit}
                    disabled={!selectedTime || !selectedRoomId || isSubmitting}>
                {isSubmitting ? 'Бронируем...' : 'Забронировать'}
            </button>
        </div>
    );
};

export default BookingPage;