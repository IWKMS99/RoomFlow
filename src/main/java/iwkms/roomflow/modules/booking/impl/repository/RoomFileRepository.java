package iwkms.roomflow.modules.booking.impl.repository;

import iwkms.roomflow.modules.booking.impl.domain.RoomFile;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoomFileRepository extends JpaRepository<RoomFile, UUID> {
    List<RoomFile> findByRoom_Id(UUID roomId);

    List<RoomFile> findByRoom_IdInAndContentTypeInOrderByCreatedAtAsc(
            Collection<UUID> roomIds, Collection<String> contentTypes);
}
