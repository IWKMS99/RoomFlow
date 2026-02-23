package iwkms.roomflow;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import iwkms.roomflow.modules.booking.impl.domain.Room;
import iwkms.roomflow.modules.booking.impl.domain.RoomFile;
import iwkms.roomflow.modules.booking.impl.repository.RoomFileRepository;
import iwkms.roomflow.modules.booking.impl.repository.RoomRepository;
import iwkms.roomflow.modules.booking.impl.service.FileStorageService;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Import(TestcontainersConfiguration.class)
@Transactional
class ScheduleCoverImageIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private RoomFileRepository roomFileRepository;

    @MockitoBean
    private FileStorageService fileStorageService;

    private Room roomA;

    @BeforeEach
    void setUp() {
        roomA = roomRepository
                .findById(UUID.fromString("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"))
                .orElseThrow();
    }

    @Test
    @DisplayName("GET /schedule: returns coverImageUrl from first image file")
    void shouldReturnCoverImageFromFirstImageFile() throws Exception {
        roomFileRepository.save(RoomFile.builder()
                .id(UUID.randomUUID())
                .room(roomA)
                .fileKey("rooms/first.png")
                .originalName("first.png")
                .contentType("image/png")
                .size(100L)
                .createdAt(LocalDateTime.now().minusMinutes(10))
                .build());
        roomFileRepository.save(RoomFile.builder()
                .id(UUID.randomUUID())
                .room(roomA)
                .fileKey("rooms/second.jpg")
                .originalName("second.jpg")
                .contentType("image/jpeg")
                .size(100L)
                .createdAt(LocalDateTime.now().minusMinutes(2))
                .build());

        when(fileStorageService.generatePresignedUrl("rooms/first.png")).thenReturn("https://cdn.local/first.png");

        String body = mockMvc.perform(get("/api/v1/schedule")
                        .param("date", LocalDate.now().plusDays(1).toString()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode roomNode = findRoomNodeById(body, roomA.getId().toString());
        assertThat(roomNode.get("coverImageUrl").asText()).isEqualTo("https://cdn.local/first.png");
    }

    @Test
    @DisplayName("GET /schedule: returns null coverImageUrl when presign fails")
    void shouldReturnNullCoverImageWhenPresignFails() throws Exception {
        roomFileRepository.save(RoomFile.builder()
                .id(UUID.randomUUID())
                .room(roomA)
                .fileKey("rooms/fail.png")
                .originalName("fail.png")
                .contentType("image/png")
                .size(100L)
                .createdAt(LocalDateTime.now().minusMinutes(5))
                .build());

        when(fileStorageService.generatePresignedUrl("rooms/fail.png"))
                .thenThrow(new RuntimeException("Presign failed"));

        String body = mockMvc.perform(get("/api/v1/schedule")
                        .param("date", LocalDate.now().plusDays(1).toString()))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode roomNode = findRoomNodeById(body, roomA.getId().toString());
        assertThat(roomNode.get("coverImageUrl").isNull()).isTrue();
    }

    private JsonNode findRoomNodeById(String payload, String roomId) throws Exception {
        JsonNode root = objectMapper.readTree(payload);
        JsonNode firstSlotRooms = root.get("timeSlots").get(0).get("rooms");
        for (JsonNode roomNode : firstSlotRooms) {
            if (roomId.equals(roomNode.get("roomId").asText())) {
                return roomNode;
            }
        }
        throw new IllegalStateException("Room node not found for roomId=" + roomId);
    }
}
