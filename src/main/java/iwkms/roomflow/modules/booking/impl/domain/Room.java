package iwkms.roomflow.modules.booking.impl.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.util.UUID;
import lombok.*;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    private UUID id;

    private String name;
    private int floor;
    private int capacity;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
}
