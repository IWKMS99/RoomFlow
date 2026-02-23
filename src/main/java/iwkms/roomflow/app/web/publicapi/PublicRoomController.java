package iwkms.roomflow.app.web.publicapi;

import iwkms.roomflow.exception.ResourceNotFoundException;
import iwkms.roomflow.modules.booking.api.dto.PublicRoomDto;
import iwkms.roomflow.modules.booking.impl.domain.Room;
import iwkms.roomflow.modules.booking.impl.repository.RoomRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
public class PublicRoomController {

    private final RoomRepository roomRepository;

    @GetMapping("/{id}")
    public ResponseEntity<PublicRoomDto> getRoom(@PathVariable UUID id) {
        Room room = roomRepository
                .findByIdAndActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id " + id + " not found"));
        return ResponseEntity.ok(new PublicRoomDto(room.getId(), room.getName(), room.getFloor(), room.getCapacity()));
    }
}
