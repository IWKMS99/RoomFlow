package iwkms.roomflow;

import com.fasterxml.jackson.databind.ObjectMapper;
import iwkms.roomflow.modules.booking.api.dto.CreateBookingRequestDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
}