package iwkms.roomflow.modules.booking.impl.service;

import iwkms.roomflow.exception.ResourceNotFoundException;
import iwkms.roomflow.modules.booking.api.dto.RoomFileDto;
import iwkms.roomflow.modules.booking.impl.domain.Room;
import iwkms.roomflow.modules.booking.impl.domain.RoomFile;
import iwkms.roomflow.modules.booking.impl.repository.RoomFileRepository;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminRoomFileService {

    private final AdminRoomService adminRoomService;
    private final RoomFileRepository roomFileRepository;
    private final FileStorageService fileStorageService;

    public RoomFileDto upload(UUID roomId, MultipartFile file) {
        Room room = adminRoomService.requireActiveRoom(roomId);
        String fileKey = fileStorageService.uploadFile(file);

        RoomFile roomFile = RoomFile.builder()
                .id(UUID.randomUUID())
                .room(room)
                .fileKey(fileKey)
                .originalName(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename())
                .contentType(file.getContentType() == null ? "application/octet-stream" : file.getContentType())
                .size(file.getSize())
                .build();

        RoomFile saved = roomFileRepository.save(roomFile);
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<RoomFileDto> list(UUID roomId) {
        adminRoomService.requireActiveRoom(roomId);
        return roomFileRepository.findByRoom_Id(roomId).stream()
                .map(this::toDto)
                .toList();
    }

    public void delete(UUID fileId) {
        RoomFile file = roomFileRepository
                .findById(fileId)
                .orElseThrow(() -> new ResourceNotFoundException("Room file with id " + fileId + " not found"));
        fileStorageService.deleteFile(file.getFileKey());
        roomFileRepository.delete(file);
    }

    private RoomFileDto toDto(RoomFile roomFile) {
        return new RoomFileDto(
                roomFile.getId(),
                roomFile.getFileKey(),
                roomFile.getOriginalName(),
                roomFile.getContentType(),
                roomFile.getSize(),
                fileStorageService.generatePresignedUrl(roomFile.getFileKey()));
    }
}
