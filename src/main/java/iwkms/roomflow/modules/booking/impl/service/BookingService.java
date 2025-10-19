package iwkms.roomflow.modules.booking.impl.service;

import iwkms.roomflow.exception.ResourceNotFoundException;
import iwkms.roomflow.modules.booking.api.dto.*;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;
import iwkms.roomflow.modules.booking.impl.domain.Room;
import iwkms.roomflow.modules.booking.impl.repository.BookingRepository;
import iwkms.roomflow.modules.booking.impl.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    @Transactional
    public Booking bookRoom(BookRoomDto command) {
        // TODO: Валидация пересечений
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

    @Transactional
    public void cancelBooking(CancelBookingDto command) {
        Booking booking = bookingRepository.findById(command.bookingId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Booking with id " + command.bookingId() + " not found"));
        // TODO: Проверка прав
        booking.setStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> findByUserId(UUID userId) {
        return bookingRepository.findByUserId(userId);
    }


    @Transactional(readOnly = true)
    public ScheduleViewDto getScheduleForDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);
        LocalTime workingDayStart = LocalTime.of(9, 0);
        LocalTime workingDayEnd = LocalTime.of(18, 0);

        List<Room> allRooms = roomRepository.findAll();
        List<Booking> bookingsForDay = bookingRepository.findActiveBookingsBetween(startOfDay, endOfDay);

        List<TimeSlotViewDto> timeSlots = new ArrayList<>();
        for (
                LocalTime slotTime = workingDayStart;
                slotTime.isBefore(workingDayEnd); slotTime = slotTime.plusHours(1)
        ) {
            final LocalDateTime currentSlotStart = date.atTime(slotTime);
            final LocalDateTime currentSlotEnd = currentSlotStart.plusHours(1);

            List<RoomInScheduleViewDto> roomStatuses = allRooms.stream().map(room -> {
                boolean isAvailable = bookingsForDay.stream()
                        .filter(booking -> booking.getRoomId().equals(room.getId()))
                        .noneMatch(booking ->
                                booking.getStartTime().isBefore(currentSlotEnd) &&
                                        booking.getEndTime().isAfter(currentSlotStart)
                        );
                return new RoomInScheduleViewDto(room.getId(), room.getName(), isAvailable);
            }).collect(Collectors.toList());

            timeSlots.add(new TimeSlotViewDto(slotTime, roomStatuses));
        }

        return new ScheduleViewDto(timeSlots);
    }
}