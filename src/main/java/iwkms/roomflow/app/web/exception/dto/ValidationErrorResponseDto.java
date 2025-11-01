package iwkms.roomflow.app.web.exception.dto;

import java.util.List;

public record ValidationErrorResponseDto(int status, String message, List<Violation> violations) {
    public ValidationErrorResponseDto(int status, String message, List<Violation> violations) {
        this.status = status;
        this.message = message;
        this.violations = violations != null ? List.copyOf(violations) : List.of();
    }

    @Override
    public List<Violation> violations() {
        return violations;
    }

    public record Violation(String field, String description) {}
}
