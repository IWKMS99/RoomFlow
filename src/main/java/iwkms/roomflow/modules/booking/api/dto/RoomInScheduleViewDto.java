package iwkms.roomflow.modules.booking.api.dto;

import java.util.UUID;

public record RoomInScheduleViewDto(
        UUID roomId, String roomName, int capacity, int floor, boolean isAvailable, String coverImageUrl) {}
