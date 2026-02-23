package iwkms.roomflow.modules.booking.impl.service;

import static iwkms.roomflow.util.Constants.Schedule.WORKING_DAY_END;
import static iwkms.roomflow.util.Constants.Schedule.WORKING_DAY_START;

import iwkms.roomflow.modules.booking.api.dto.RoomInScheduleViewDto;
import iwkms.roomflow.modules.booking.api.dto.ScheduleViewDto;
import iwkms.roomflow.modules.booking.api.dto.TimeSlotViewDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.domain.Room;
import iwkms.roomflow.modules.booking.impl.domain.RoomFile;
import iwkms.roomflow.modules.booking.impl.repository.BookingRepository;
import iwkms.roomflow.modules.booking.impl.repository.RoomFileRepository;
import iwkms.roomflow.modules.booking.impl.repository.RoomRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class ScheduleService {

    private static final List<String> IMAGE_CONTENT_TYPES = List.of("image/jpeg", "image/png");

    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final RoomFileRepository roomFileRepository;
    private final FileStorageService fileStorageService;

    public List<Booking> findByUserId(UUID userId) {
        return bookingRepository.findByUserId(userId);
    }

    public ScheduleViewDto getScheduleForDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<Room> allRooms = roomRepository.findByActiveTrue();
        List<Booking> bookingsForDay = bookingRepository.findActiveBookingsBetween(startOfDay, endOfDay);
        Map<UUID, String> coverImageUrls = resolveRoomCoverUrls(allRooms);

        List<TimeSlotViewDto> timeSlots = new ArrayList<>();
        for (LocalTime slotTime = WORKING_DAY_START;
                slotTime.isBefore(WORKING_DAY_END);
                slotTime = slotTime.plusMinutes(30)) {
            final LocalDateTime currentSlotStart = date.atTime(slotTime);
            final LocalDateTime currentSlotEnd = currentSlotStart.plusMinutes(30);

            List<RoomInScheduleViewDto> roomStatuses = allRooms.stream()
                    .map(room -> {
                        boolean isAvailable = bookingsForDay.stream()
                                .filter(booking -> booking.getRoom().getId().equals(room.getId()))
                                .noneMatch(booking -> booking.getStartTime().isBefore(currentSlotEnd)
                                        && booking.getEndTime().isAfter(currentSlotStart));
                        return new RoomInScheduleViewDto(
                                room.getId(),
                                room.getName(),
                                room.getCapacity(),
                                room.getFloor(),
                                isAvailable,
                                coverImageUrls.get(room.getId()));
                    })
                    .collect(Collectors.toList());

            timeSlots.add(new TimeSlotViewDto(slotTime, roomStatuses));
        }

        return new ScheduleViewDto(timeSlots);
    }

    private Map<UUID, String> resolveRoomCoverUrls(List<Room> rooms) {
        if (rooms.isEmpty()) {
            return Collections.emptyMap();
        }

        List<UUID> roomIds = rooms.stream().map(Room::getId).toList();
        List<RoomFile> imageFiles =
                roomFileRepository.findByRoom_IdInAndContentTypeInOrderByCreatedAtAsc(roomIds, IMAGE_CONTENT_TYPES);

        Map<UUID, RoomFile> firstFileByRoomId = new HashMap<>();
        for (RoomFile roomFile : imageFiles) {
            UUID roomId = roomFile.getRoom().getId();
            firstFileByRoomId.putIfAbsent(roomId, roomFile);
        }

        Map<UUID, String> coverUrls = new HashMap<>();
        for (Map.Entry<UUID, RoomFile> entry : firstFileByRoomId.entrySet()) {
            try {
                coverUrls.put(
                        entry.getKey(),
                        fileStorageService.generatePresignedUrl(entry.getValue().getFileKey()));
            } catch (RuntimeException ex) {
                log.warn("Failed to generate cover URL for room {}: {}", entry.getKey(), ex.getMessage());
            }
        }
        return coverUrls;
    }
}
