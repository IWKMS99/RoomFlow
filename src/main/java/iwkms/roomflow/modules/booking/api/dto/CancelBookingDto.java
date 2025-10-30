package iwkms.roomflow.modules.booking.api.dto;

import iwkms.roomflow.modules.user.impl.domain.User;

import java.util.UUID;

public record CancelBookingDto(
        UUID bookingId,
        User currentUser
) {
}