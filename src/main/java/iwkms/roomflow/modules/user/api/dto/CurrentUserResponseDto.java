package iwkms.roomflow.modules.user.api.dto;

import java.util.Set;
import java.util.UUID;

public record CurrentUserResponseDto(UUID id, String email, Set<String> roles) {

    public CurrentUserResponseDto {
        roles = Set.copyOf(roles);
    }

    @Override
    public Set<String> roles() {
        return Set.copyOf(roles);
    }
}
