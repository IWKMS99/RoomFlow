package iwkms.roomflow.modules.booking.impl.repository;

import iwkms.roomflow.modules.booking.impl.domain.Room;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomRepository extends JpaRepository<Room, UUID> {}
