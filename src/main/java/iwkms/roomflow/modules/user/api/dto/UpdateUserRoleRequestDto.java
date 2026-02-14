package iwkms.roomflow.modules.user.api.dto;

import iwkms.roomflow.modules.user.impl.domain.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateUserRoleRequestDto(@NotNull Role role) {}
