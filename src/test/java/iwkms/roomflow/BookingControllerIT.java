package iwkms.roomflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import iwkms.roomflow.modules.booking.api.dto.CreateBookingRequestDto;
import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;
import iwkms.roomflow.modules.booking.impl.repository.BookingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class BookingControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    @DisplayName(
            "POST /bookings -> GET /my-bookings:" +
                    " должен создать бронирование для 'текущего' пользователя и успешно его получить"
    )
    void shouldCreateBookingAndRetrieveItSuccessfully() throws Exception {
        UUID existingRoomId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID currentUserId = UUID.fromString("00000000-0000-0000-0000-000000000001");

        CreateBookingRequestDto createRequest = new CreateBookingRequestDto(
                existingRoomId,
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withNano(0),
                LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).withNano(0)
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createRequest)))
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.roomId", is(existingRoomId.toString())))
                .andExpect(jsonPath("$.userId", is(currentUserId.toString())))
                .andExpect(jsonPath("$.status", is("CONFIRMED")));

        mockMvc.perform(get("/api/v1/my-bookings")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].roomId", is(existingRoomId.toString())))
                .andExpect(jsonPath("$[0].userId", is(currentUserId.toString())));
    }

    @Test
    @DisplayName("GET /schedule: должен вернуть корректную сетку занятости для указанной даты")
    void shouldReturnCorrectScheduleForDate() throws Exception {
        LocalDate testDate = LocalDate.now().plusDays(1);
        UUID roomA_Id = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID testUserId = UUID.fromString("00000000-0000-0000-0000-000000000002");

        Booking bookingForRoomA = Booking.builder()
                .id(UUID.randomUUID())
                .roomId(roomA_Id)
                .userId(testUserId)
                .startTime(testDate.atTime(10, 0))
                .endTime(testDate.atTime(11, 0))
                .status(BookingStatus.CONFIRMED)
                .build();
        bookingRepository.save(bookingForRoomA);

        mockMvc.perform(get("/api/v1/schedule")
                        .param("date", testDate.toString())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.timeSlots", hasSize(9)))

                .andExpect(jsonPath("$.timeSlots[0].time", is("09:00:00")))
                .andExpect(jsonPath("$.timeSlots[0].rooms[0].roomName", is("Переговорка А")))
                .andExpect(jsonPath("$.timeSlots[0].rooms[0].isAvailable", is(true)))
                .andExpect(jsonPath("$.timeSlots[0].rooms[1].roomName", is("Переговорка Б")))
                .andExpect(jsonPath("$.timeSlots[0].rooms[1].isAvailable", is(true)))

                .andExpect(jsonPath("$.timeSlots[1].time", is("10:00:00")))
                .andExpect(jsonPath("$.timeSlots[1].rooms[0].roomName", is("Переговорка А")))
                .andExpect(jsonPath("$.timeSlots[1].rooms[0].isAvailable", is(false)))
                .andExpect(jsonPath("$.timeSlots[1].rooms[1].roomName", is("Переговорка Б")))
                .andExpect(jsonPath("$.timeSlots[1].rooms[1].isAvailable", is(true)))

                .andExpect(jsonPath("$.timeSlots[2].time", is("11:00:00")))
                .andExpect(jsonPath("$.timeSlots[2].rooms[0].roomName", is("Переговорка А")))
                .andExpect(jsonPath("$.timeSlots[2].rooms[0].isAvailable", is(true)))
                .andExpect(jsonPath("$.timeSlots[2].rooms[1].roomName", is("Переговорка Б")))
                .andExpect(jsonPath("$.timeSlots[2].rooms[1].isAvailable", is(true)));
    }

    @Test
    @DisplayName("DELETE /bookings/{id}: должен успешно отменить существующее бронирование")
    void shouldCancelBookingSuccessfully() throws Exception {
        UUID roomA_Id = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID testUserId = UUID.fromString("00000000-0000-0000-0000-000000000003");

        Booking bookingToCancel = Booking.builder()
                .id(UUID.randomUUID())
                .roomId(roomA_Id)
                .userId(testUserId)
                .startTime(LocalDateTime.now().plusDays(2).withHour(14).withMinute(0).withNano(0))
                .endTime(LocalDateTime.now().plusDays(2).withHour(15).withMinute(0).withNano(0))
                .status(BookingStatus.CONFIRMED)
                .build();
        bookingRepository.saveAndFlush(bookingToCancel);

        mockMvc.perform(delete("/api/v1/bookings/" + bookingToCancel.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        Booking updatedBooking = bookingRepository.findById(bookingToCancel.getId()).orElseThrow();
        assertEquals(BookingStatus.CANCELLED, updatedBooking.getStatus());
    }

    @Test
    @DisplayName("DELETE /bookings/{id}: должен вернуть 404 Not Found для несуществующего бронирования")
    void shouldReturnNotFoundForNonExistentBooking() throws Exception {
        UUID nonExistentId = UUID.randomUUID();

        mockMvc.perform(delete("/api/v1/bookings/" + nonExistentId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("POST /bookings: должен вернуть 400 Bad Request, если время начала после времени окончания")
    void shouldReturnBadRequestWhenStartTimeIsAfterEndTime() throws Exception {
        UUID existingRoomId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");

        CreateBookingRequestDto invalidRequest = new CreateBookingRequestDto(
                existingRoomId,
                LocalDateTime.now().plusDays(1).withHour(11).withMinute(0).withNano(0),
                LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withNano(0)
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", is("Validation failed")))
                .andExpect(jsonPath("$.violations[0].description",
                        is("End time must be after start time")));
    }

    @Test
    @DisplayName("POST /bookings: должен вернуть 409 Conflict при попытке забронировать уже занятое время")
    void shouldReturnConflictWhenBookingOverlaps() throws Exception {
        UUID roomId = UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa");
        UUID firstUserId = UUID.fromString("00000000-0000-0000-0000-000000000004");

        Booking initialBooking = Booking.builder()
                .id(UUID.randomUUID())
                .roomId(roomId)
                .userId(firstUserId)
                .startTime(LocalDateTime.now().plusDays(3).withHour(12).withMinute(0).withNano(0))
                .endTime(LocalDateTime.now().plusDays(3).withHour(13).withMinute(0).withNano(0))
                .status(BookingStatus.CONFIRMED)
                .build();
        bookingRepository.saveAndFlush(initialBooking);

        CreateBookingRequestDto conflictingRequest = new CreateBookingRequestDto(
                roomId,
                LocalDateTime.now().plusDays(3).withHour(12).withMinute(30).withNano(0),
                LocalDateTime.now().plusDays(3).withHour(13).withMinute(30).withNano(0)
        );

        mockMvc.perform(post("/api/v1/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(conflictingRequest)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.message",
                        is("Room is already booked for the selected time period.")));
    }
}