package iwkms.roomflow.modules.booking.api.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record BookRoomDto(UUID userId, UUID roomId, LocalDateTime startTime, LocalDateTime endTime) {}
