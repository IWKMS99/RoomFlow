package iwkms.roomflow.modules.booking.api;

import iwkms.roomflow.modules.booking.api.dto.BookRoomDto;
import iwkms.roomflow.modules.booking.api.dto.BookingResponseDto;
import iwkms.roomflow.modules.booking.api.dto.CancelBookingDto;
import iwkms.roomflow.modules.booking.api.dto.ScheduleViewDto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BookingApi {

    BookingResponseDto bookRoom(BookRoomDto command);
    void cancelBooking(CancelBookingDto command);
    List<BookingResponseDto> findByUserId(UUID userId);
    ScheduleViewDto findScheduleByDate(LocalDate date);
}