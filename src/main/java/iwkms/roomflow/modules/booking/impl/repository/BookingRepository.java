package iwkms.roomflow.modules.booking.impl.repository;

import iwkms.roomflow.modules.booking.impl.domain.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByUserId(UUID userId);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.status <> 'CANCELLED'
            AND b.startTime < :endOfDay
            AND b.endTime > :startOfDay
            """)
    List<Booking> findActiveBookingsBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);

    @Query("""
            SELECT b FROM Booking b
            WHERE b.roomId = :roomId
            AND b.status <> 'CANCELLED'
            AND b.startTime < :endTime
            AND b.endTime > :startTime
            """)
    List<Booking> findConflictingBookings(UUID roomId, LocalDateTime startTime, LocalDateTime endTime);
}