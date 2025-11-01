package iwkms.roomflow.modules.user.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

public record LoginRequestDto(
        @NotEmpty(message = "Email cannot be empty") @Email(message = "Invalid email format") String email,
        @NotEmpty(message = "Password cannot be empty") String password) {}
