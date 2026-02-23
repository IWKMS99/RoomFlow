export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface BookingResponse {
    id: string;
    roomId: string;
    roomName: string;
    capacity: number;
    floor: number;
    userId: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
}

export interface RoomInSchedule {
    roomId: string;
    roomName: string;
    capacity: number;
    floor: number;
    isAvailable: boolean;
    coverImageUrl?: string | null;
}

export interface TimeSlot {
    time: string;
    rooms: RoomInSchedule[];
}

export interface ScheduleView {
    timeSlots: TimeSlot[];
}

export interface CreateBookingPayload {
    roomId: string;
    startTime: string;
    endTime: string;
}

export interface AdminBooking {
    id: string;
    roomId: string;
    roomName: string;
    capacity: number;
    floor: number;
    userId: string;
    userEmail: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
}

export interface AdminBookingFilters {
    date: string;
    roomId?: string;
    userEmail?: string;
    status?: BookingStatus;
}
