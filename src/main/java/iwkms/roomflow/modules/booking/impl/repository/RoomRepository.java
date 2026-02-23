package iwkms.roomflow.modules.booking.impl.repository;

import iwkms.roomflow.modules.booking.impl.domain.Room;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID>, JpaSpecificationExecutor<Room> {
    Optional<Room> findByIdAndActiveTrue(UUID id);

    List<Room> findByActiveTrue();
}
