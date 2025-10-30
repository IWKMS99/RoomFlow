export type BookingStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface BookingResponse {
    id: string;
    roomId: string;
    roomName: string;
    userId: string;
    startTime: string;
    endTime: string;
    status: BookingStatus;
}

export interface RoomInSchedule {
    roomId: string;
    roomName: string;
    isAvailable: boolean;
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