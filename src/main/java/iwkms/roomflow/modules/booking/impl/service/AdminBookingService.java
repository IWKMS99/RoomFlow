package iwkms.roomflow.modules.booking.impl.service;

import iwkms.roomflow.modules.booking.api.dto.AdminBookingResponseDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;
import iwkms.roomflow.modules.booking.impl.repository.BookingRepository;
import iwkms.roomflow.modules.user.impl.domain.User;
import iwkms.roomflow.modules.user.impl.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminBookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public List<AdminBookingResponseDto> findBookings(
            LocalDate date, UUID roomId, String userEmail, BookingStatus status) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = startOfDay.plusDays(1);
        List<Booking> bookings = bookingRepository.findAdminBookings(startOfDay, endOfDay, roomId, status);

        Map<UUID, String> userEmailById =
                userRepository
                        .findAllById(bookings.stream().map(Booking::getUserId).collect(Collectors.toSet()))
                        .stream()
                        .collect(Collectors.toMap(User::getId, User::getEmail));

        String normalizedUserEmail = userEmail == null ? null : userEmail.trim().toLowerCase();

        return bookings.stream()
                .map(booking -> toDto(booking, userEmailById.getOrDefault(booking.getUserId(), "unknown")))
                .filter(booking -> {
                    if (normalizedUserEmail == null || normalizedUserEmail.isBlank()) {
                        return true;
                    }
                    return booking.userEmail().toLowerCase().contains(normalizedUserEmail);
                })
                .toList();
    }

    private AdminBookingResponseDto toDto(Booking booking, String email) {
        return new AdminBookingResponseDto(
                booking.getId(),
                booking.getRoom().getId(),
                booking.getRoom().getName(),
                booking.getRoom().getCapacity(),
                booking.getRoom().getFloor(),
                booking.getUserId(),
                email,
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getStatus());
    }
}
