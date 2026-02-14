import axios from 'axios';
import type {BookingResponse, CreateBookingPayload, ScheduleView} from '../types/booking.ts';

export interface AdminUser {
    id: string;
    email: string;
    roles: string[];
}

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export const setupInterceptors = (logout: () => void) => {
    apiClient.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.error("Unauthorized request. Logging out.");
                logout();
            }
            return Promise.reject(error);
        }
    );
};

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

export const registerUser = async (payload: any) => {
    const response = await apiClient.post('/auth/register', payload);
    return response.data;
}

export const loginUser = async (payload: any) => {
    const response = await apiClient.post('/auth/login', payload);
    return response.data;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    const response = await apiClient.get<AdminUser[]>('/admin/users');
    return response.data;
};

export const updateUserRole = async (userId: string, role: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<AdminUser> => {
    const response = await apiClient.put<AdminUser>(`/admin/users/${userId}/role`, {role});
    return response.data;
};
