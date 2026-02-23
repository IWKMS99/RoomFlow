package iwkms.roomflow.modules.booking.impl.repository;

import iwkms.roomflow.modules.booking.impl.domain.Booking;
import iwkms.roomflow.modules.booking.impl.domain.BookingStatus;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByUserId(UUID userId);

    @Query(
            """
            SELECT b FROM Booking b
            WHERE b.status <> 'CANCELLED'
            AND b.startTime < :endOfDay
            AND b.endTime > :startOfDay
            """)
    List<Booking> findActiveBookingsBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query(
            """
            SELECT b FROM Booking b
            WHERE b.room.id = :roomId
            AND b.status <> 'CANCELLED'
            AND b.startTime < :endTime
            AND b.endTime > :startTime
            """)
    List<Booking> findConflictingBookings(UUID roomId, LocalDateTime startTime, LocalDateTime endTime);

    @Query(
            """
            SELECT b FROM Booking b
            WHERE b.startTime < :endOfDay
            AND b.endTime > :startOfDay
            AND (:roomId IS NULL OR b.room.id = :roomId)
            AND (:status IS NULL OR b.status = :status)
            ORDER BY b.startTime ASC
            """)
    List<Booking> findAdminBookings(
            LocalDateTime startOfDay, LocalDateTime endOfDay, UUID roomId, BookingStatus status);
}
