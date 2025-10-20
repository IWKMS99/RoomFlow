package iwkms.roomflow.app.web.booking;

import iwkms.roomflow.modules.booking.api.BookingApi;
import iwkms.roomflow.modules.booking.api.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static iwkms.roomflow.util.Constants.Api.MOCK_USER_ID;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class BookingController implements BookingApiContract {

    private final BookingApi bookingApi;

    @Override
    @PostMapping("/bookings")
    public ResponseEntity<BookingResponseDto> createBooking(@Valid @RequestBody CreateBookingRequestDto request) {
        // TODO: Получить userId из Security Context
        BookRoomDto command = new BookRoomDto(
                MOCK_USER_ID,
                request.roomId(),
                request.startTime(),
                request.endTime()
        );
        BookingResponseDto response = bookingApi.bookRoom(command);
        return ResponseEntity.created(URI.create("/api/v1/bookings/" + response.id())).body(response);
    }

    @Override
    @DeleteMapping("/bookings/{bookingId}")
    public ResponseEntity<Void> cancelBooking(@PathVariable UUID bookingId) {
        // TODO: Получить userId из Security Context
        CancelBookingDto command = new CancelBookingDto(bookingId, MOCK_USER_ID);
        bookingApi.cancelBooking(command);
        return ResponseEntity.noContent().build();
    }

    @Override
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponseDto>> getMyBookings() {
        // TODO: Получить userId из Security Context
        List<BookingResponseDto> response = bookingApi.findByUserId(MOCK_USER_ID);
        return ResponseEntity.ok(response);
    }

    @Override
    @GetMapping("/schedule")
    public ResponseEntity<ScheduleViewDto> getSchedule(@RequestParam("date") LocalDate date) {
        ScheduleViewDto schedule = bookingApi.findScheduleByDate(date);
        return ResponseEntity.ok(schedule);
    }
}