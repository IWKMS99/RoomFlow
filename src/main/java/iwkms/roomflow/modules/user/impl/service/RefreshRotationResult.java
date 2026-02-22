package iwkms.roomflow.modules.user.impl.service;

import iwkms.roomflow.modules.user.impl.domain.Role;
import java.util.Set;

public record RefreshRotationResult(String userEmail, Set<Role> roles, String refreshToken) {

    public RefreshRotationResult {
        roles = Set.copyOf(roles);
    }

    @Override
    public Set<Role> roles() {
        return Set.copyOf(roles);
    }
}
