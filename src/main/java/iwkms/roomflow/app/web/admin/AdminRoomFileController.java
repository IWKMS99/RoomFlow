package iwkms.roomflow.app.web.admin;

import iwkms.roomflow.modules.booking.api.dto.RoomFileDto;
import iwkms.roomflow.modules.booking.impl.service.AdminRoomFileService;
import java.net.URI;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/rooms")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminRoomFileController {

    private final AdminRoomFileService adminRoomFileService;

    @PostMapping(value = "/{id}/files", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RoomFileDto> uploadRoomFile(@PathVariable UUID id, @RequestParam("file") MultipartFile file) {
        RoomFileDto created = adminRoomFileService.upload(id, file);
        return ResponseEntity.created(URI.create("/api/v1/admin/rooms/files/" + created.id()))
                .body(created);
    }

    @GetMapping("/{id}/files")
    public ResponseEntity<List<RoomFileDto>> listRoomFiles(@PathVariable UUID id) {
        return ResponseEntity.ok(adminRoomFileService.list(id));
    }

    @DeleteMapping("/files/{fileId}")
    public ResponseEntity<Void> deleteRoomFile(@PathVariable UUID fileId) {
        adminRoomFileService.delete(fileId);
        return ResponseEntity.noContent().build();
    }
}
