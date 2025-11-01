package iwkms.roomflow.modules.booking.api.dto;

import java.time.LocalTime;
import java.util.List;

public record TimeSlotViewDto(LocalTime time, List<RoomInScheduleViewDto> rooms) {}
