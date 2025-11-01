package iwkms.roomflow.app.web.exception.dto;

import java.util.List;

public record ValidationErrorResponseDto(int status, String message, List<Violation> violations) {
    public record Violation(String field, String description) {}
}
