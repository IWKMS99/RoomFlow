package iwkms.roomflow.app.web.admin;

import iwkms.roomflow.modules.booking.api.dto.AdminBookingResponseDto;
import iwkms.roomflow.modules.booking.api.dto.CancelBookingDto;
import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;
import iwkms.roomflow.modules.booking.impl.service.AdminBookingService;
import iwkms.roomflow.modules.booking.impl.service.BookingManagementService;
import iwkms.roomflow.modules.user.api.dto.AdminUserResponseDto;
import iwkms.roomflow.modules.user.api.dto.UpdateUserRoleRequestDto;
import iwkms.roomflow.modules.user.impl.domain.User;
import iwkms.roomflow.modules.user.impl.service.AdminUserService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminUserService adminUserService;
    private final AdminBookingService adminBookingService;
    private final BookingManagementService bookingManagementService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.findAllUsers());
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserResponseDto> updateUserRole(
            @PathVariable UUID userId, @Valid @RequestBody UpdateUserRoleRequestDto request) {
        User currentUser = getCurrentUser();
        AdminUserResponseDto updatedUser = adminUserService.updateUserRole(currentUser.getId(), userId, request.role());
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/bookings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminBookingResponseDto>> getAllBookings(
            @RequestParam LocalDate date,
            @RequestParam(required = false) UUID roomId,
            @RequestParam(required = false) String userEmail,
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(adminBookingService.findBookings(date, roomId, userEmail, status));
    }

    @DeleteMapping("/bookings/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> cancelBooking(@PathVariable UUID bookingId) {
        User currentUser = getCurrentUser();
        bookingManagementService.cancelBooking(new CancelBookingDto(bookingId, currentUser.getId()));
        return ResponseEntity.noContent().build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
}
