package iwkms.roomflow.modules.booking.impl.repository;

import iwkms.roomflow.modules.booking.impl.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {
}