package iwkms.roomflow.modules.booking.api.dto;

import java.util.UUID;

public record RoomFileDto(UUID id, String fileKey, String originalName, String contentType, long size, String url) {}
