package iwkms.roomflow.modules.booking.impl.service;

import iwkms.roomflow.exception.ResourceNotFoundException;
import iwkms.roomflow.modules.booking.api.dto.AdminRoomDto;
import iwkms.roomflow.modules.booking.api.dto.CreateRoomRequestDto;
import iwkms.roomflow.modules.booking.api.dto.UpdateRoomRequestDto;
import iwkms.roomflow.modules.booking.impl.domain.Room;
import iwkms.roomflow.modules.booking.impl.repository.RoomRepository;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminRoomService {

    private final RoomRepository roomRepository;

    @Transactional(readOnly = true)
    public Page<AdminRoomDto> findRooms(String search, Integer floor, Integer minCapacity, Pageable pageable) {
        Specification<Room> specification =
                Specification.where((root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("active")));

        if (search != null && !search.trim().isEmpty()) {
            String normalizedSearch = "%" + search.trim().toLowerCase() + "%";
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), normalizedSearch));
        }

        if (floor != null) {
            specification = specification.and(
                    (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("floor"), floor));
        }

        if (minCapacity != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
        }

        return roomRepository.findAll(specification, pageable).map(this::toDto);
    }

    public AdminRoomDto create(CreateRoomRequestDto request) {
        Room room = Room.builder()
                .id(UUID.randomUUID())
                .name(request.name().trim())
                .floor(request.floor())
                .capacity(request.capacity())
                .active(true)
                .build();
        return toDto(roomRepository.save(room));
    }

    public AdminRoomDto update(UUID roomId, UpdateRoomRequestDto request) {
        Room room = requireActiveRoom(roomId);
        room.setName(request.name().trim());
        room.setFloor(request.floor());
        room.setCapacity(request.capacity());
        return toDto(roomRepository.save(room));
    }

    public void softDelete(UUID roomId) {
        Room room = requireActiveRoom(roomId);
        room.setActive(false);
        roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public Room requireActiveRoom(UUID roomId) {
        return roomRepository
                .findByIdAndActiveTrue(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room with id " + roomId + " not found"));
    }

    private AdminRoomDto toDto(Room room) {
        return new AdminRoomDto(room.getId(), room.getName(), room.getFloor(), room.getCapacity(), room.isActive());
    }
}
