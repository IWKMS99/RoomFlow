package iwkms.roomflow.modules.booking.impl;

import iwkms.roomflow.modules.booking.api.BookingApi;
import iwkms.roomflow.modules.booking.api.dto.BookRoomDto;
import iwkms.roomflow.modules.booking.api.dto.BookingResponseDto;
import iwkms.roomflow.modules.booking.api.dto.CancelBookingDto;
import iwkms.roomflow.modules.booking.api.dto.ScheduleViewDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.mapper.BookingMapper;
import iwkms.roomflow.modules.booking.impl.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class BookingApiImpl implements BookingApi {

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;

    @Override
    public BookingResponseDto bookRoom(BookRoomDto command) {
        Booking booking = bookingService.bookRoom(command);
        return bookingMapper.toResponseDTO(booking);
    }

    @Override
    public void cancelBooking(CancelBookingDto command) {
        bookingService.cancelBooking(command);
    }

    @Override
    public List<BookingResponseDto> findByUserId(UUID userId) {
        return bookingService.findByUserId(userId).stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ScheduleViewDto findScheduleByDate(LocalDate date) {
        return bookingService.getScheduleForDate(date);
    }
}