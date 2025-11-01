package iwkms.roomflow.app.web.booking;

import iwkms.roomflow.modules.booking.api.BookingApi;
import iwkms.roomflow.modules.booking.api.dto.*;
import iwkms.roomflow.modules.user.impl.domain.User;
import jakarta.validation.Valid;
import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BookingController implements BookingApiContract {

    private final BookingApi bookingApi;

    @Override
    @PostMapping("/bookings")
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody CreateBookingRequestDto request) {
        User currentUser = getCurrentUser();
        BookRoomDto command =
                new BookRoomDto(currentUser.getId(), request.roomId(), request.startTime(), request.endTime());
        BookingResponseDto response = bookingApi.bookRoom(command);
        return ResponseEntity.created(URI.create("/api/v1/bookings/" + response.id()))
                .body(response);
    }

    @Override
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<Void> cancelBooking(@PathVariable UUID bookingId) {
        User currentUser = getCurrentUser();
        CancelBookingDto command = new CancelBookingDto(bookingId, currentUser.getId());
        bookingApi.cancelBooking(command);
        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings() {
        User currentUser = getCurrentUser();
        List<BookingResponseDto> response = bookingApi.findByUserId(currentUser.getId());
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/schedule")
    public ResponseEntity<ScheduleViewDto> getSchedule(@RequestParam("date") LocalDate date) {
        ScheduleViewDto schedule = bookingApi.findScheduleByDate(date);
        return ResponseEntity.ok(schedule);
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("User is not authenticated");
        }
        return (User) authentication.getPrincipal();
    }
}
