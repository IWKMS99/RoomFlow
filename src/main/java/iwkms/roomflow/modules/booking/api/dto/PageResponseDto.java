package iwkms.roomflow.modules.booking.api.dto;

import java.util.List;

public record PageResponseDto<T>(List<T> content, int page, int size, long totalElements, int totalPages, String sort) {
    public PageResponseDto {
        content = content == null ? List.of() : List.copyOf(content);
    }
}
