package iwkms.roomflow.modules.booking.impl.mapper;

import iwkms.roomflow.modules.booking.api.dto.BookingResponseDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {
    public BookingResponseDto toResponseDTO(Booking booking) {
        return new BookingResponseDto(
                booking.getId(),
                booking.getRoom().getId(),
                booking.getRoom().getName(),
                booking.getUserId(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus()
        );
    }
}