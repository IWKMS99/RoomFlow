package iwkms.roomflow.modules.booking.api.dto;

import java.util.UUID;

public record CancelBookingDto(UUID bookingId, UUID currentUserId) {}
