package iwkms.roomflow.modules.booking.impl.service;

import iwkms.roomflow.modules.booking.api.dto.RoomInScheduleViewDto;
import iwkms.roomflow.modules.booking.api.dto.ScheduleViewDto;
import iwkms.roomflow.modules.booking.api.dto.TimeSlotViewDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
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

import static iwkms.roomflow.util.Constants.Schedule.WORKING_DAY_END;
import static iwkms.roomflow.util.Constants.Schedule.WORKING_DAY_START;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleService {

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;

    public List<Booking> findByUserId(UUID userId) {
        return bookingRepository.findByUserId(userId);
    }

    public ScheduleViewDto getScheduleForDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Room> allRooms = roomRepository.findAll();
        List<Booking> bookingsForDay = bookingRepository.findActiveBookingsBetween(startOfDay, endOfDay);

        List<TimeSlotViewDto> timeSlots = new ArrayList<>();
        for (
                LocalTime slotTime = WORKING_DAY_START;
                slotTime.isBefore(WORKING_DAY_END); slotTime = slotTime.plusHours(1)
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