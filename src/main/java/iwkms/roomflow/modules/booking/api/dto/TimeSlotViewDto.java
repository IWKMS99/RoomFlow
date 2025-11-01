package iwkms.roomflow.modules.booking.api.dto;

import java.time.LocalTime;
import java.util.List;

public record TimeSlotViewDto(LocalTime time, List<RoomInScheduleViewDto> rooms) {
    public TimeSlotViewDto(LocalTime time, List<RoomInScheduleViewDto> rooms) {
        this.time = time;
        this.rooms = rooms != null ? List.copyOf(rooms) : List.of();
    }

    @Override
    public List<RoomInScheduleViewDto> rooms() {
        return rooms;
    }
}
