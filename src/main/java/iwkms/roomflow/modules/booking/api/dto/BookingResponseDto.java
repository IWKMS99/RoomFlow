package iwkms.roomflow.modules.booking.api.dto;

import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookingResponseDto(
        UUID id,
        UUID roomId,
        UUID userId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BookingStatus status
) {
}