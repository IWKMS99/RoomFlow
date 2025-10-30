import axios from 'axios';
import type {BookingResponse, CreateBookingPayload, ScheduleView} from '../types/booking.ts';

const apiClient = axios.create({
    baseURL: 'http://localhost:8084/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchSchedule = async (date: string): Promise<ScheduleView> => {
    const response = await apiClient.get<ScheduleView>('/schedule', {
        params: {date},
    });
    return response.data;
};

export const getMyBookings = async (): Promise<BookingResponse[]> => {
    const response = await apiClient.get<BookingResponse[]>('/my-bookings');
    return response.data;
};

export const createBooking = async (payload: CreateBookingPayload): Promise<BookingResponse> => {
    const response = await apiClient.post<BookingResponse>('/bookings', payload);
    return response.data;
};

export const cancelBooking = async (bookingId: string): Promise<void> => {
    await apiClient.delete(`/bookings/${bookingId}`);
};