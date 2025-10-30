package iwkms.roomflow.modules.booking.impl.service;

import iwkms.roomflow.exception.BookingConflictException;
import iwkms.roomflow.exception.ResourceNotFoundException;
import iwkms.roomflow.modules.booking.api.dto.BookRoomDto;
import iwkms.roomflow.modules.booking.api.dto.CancelBookingDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;
import iwkms.roomflow.modules.booking.impl.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingManagementService {

    private final BookingRepository bookingRepository;


    public Booking bookRoom(BookRoomDto command) {
        List<Booking> conflictingBookings = bookingRepository.findConflictingBookings(
                command.roomId(), command.startTime(), command.endTime()
        );

        if (!conflictingBookings.isEmpty()) {
            throw new BookingConflictException("Room is already booked for the selected time period.");
        }

        Booking booking = Booking.builder()
                .id(UUID.randomUUID())
                .roomId(command.roomId())
                .userId(command.userId())
                .startTime(command.startTime())
                .endTime(command.endTime())
                .status(BookingStatus.CONFIRMED)
                .build();
        return bookingRepository.save(booking);
    }


    public void cancelBooking(CancelBookingDto command) {
        Booking booking = bookingRepository.findById(command.bookingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking with id " + command.bookingId() + " not found"));

        if (!booking.getUserId().equals(command.userId())) {
            // TODO: В будущем добавить проверку для администраторов (ROLE_ADMIN)
            throw new AccessDeniedException("You do not have permission to cancel this booking.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}