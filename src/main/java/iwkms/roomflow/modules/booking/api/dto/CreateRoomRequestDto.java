package iwkms.roomflow.modules.booking.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateRoomRequestDto(@NotBlank String name, @Min(1) int floor, @Min(1) int capacity) {}
