package iwkms.roomflow.modules.booking.api.dto;

import java.util.UUID;

public record RoomInScheduleViewDto(
        UUID roomId,
        String roomName,
        boolean isAvailable
        //TODO: В будущем можно добавить сюда bookingId, если комната занята
) {
}