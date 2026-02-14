package iwkms.roomflow.modules.user.api.dto;

import iwkms.roomflow.modules.user.impl.domain.Role;
import java.util.Set;
import java.util.UUID;

public record AdminUserResponseDto(UUID id, String email, Set<Role> roles) {}
