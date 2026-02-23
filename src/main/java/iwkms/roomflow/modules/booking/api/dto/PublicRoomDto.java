package iwkms.roomflow.modules.booking.api.dto;

import java.util.UUID;

public record PublicRoomDto(UUID id, String name, int floor, int capacity) {}
