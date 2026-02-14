package iwkms.roomflow.modules.user.impl.service;

import iwkms.roomflow.exception.ResourceNotFoundException;
import iwkms.roomflow.modules.user.api.dto.AdminUserResponseDto;
import iwkms.roomflow.modules.user.impl.domain.Role;
import iwkms.roomflow.modules.user.impl.domain.User;
import iwkms.roomflow.modules.user.impl.repository.UserRepository;
import java.util.EnumSet;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AdminUserResponseDto> findAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public AdminUserResponseDto updateUserRole(UUID actorId, UUID targetUserId, Role newRole) {
        User targetUser = userRepository
                .findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + targetUserId + " not found"));

        if (actorId.equals(targetUserId) && newRole == Role.ROLE_USER) {
            throw new AccessDeniedException("Admin cannot remove ROLE_ADMIN from themselves.");
        }

        targetUser.setRoles(EnumSet.of(newRole));
        return toDto(targetUser);
    }

    private AdminUserResponseDto toDto(User user) {
        return new AdminUserResponseDto(user.getId(), user.getEmail(), user.getRoles());
    }
}
