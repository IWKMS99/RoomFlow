package iwkms.roomflow.modules.booking.api.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateBookingRequestDto(
        @NotNull(message = "Room ID cannot be null")
        UUID roomId,

        @NotNull(message = "Start time cannot be null")
        @Future(message = "Start time must be in the future")
        LocalDateTime startTime,

        @NotNull(message = "End time cannot be null")
        @Future(message = "End time must be in the future")
        LocalDateTime endTime
) {
}