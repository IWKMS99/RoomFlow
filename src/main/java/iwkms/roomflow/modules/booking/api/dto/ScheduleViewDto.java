package iwkms.roomflow.modules.booking.api.dto;

import java.util.List;

public record ScheduleViewDto(List<TimeSlotViewDto> timeSlots) {}
