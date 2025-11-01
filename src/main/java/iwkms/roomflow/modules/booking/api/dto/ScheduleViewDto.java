package iwkms.roomflow.modules.booking.api.dto;

import java.util.List;

public record ScheduleViewDto(List<TimeSlotViewDto> timeSlots) {
    public ScheduleViewDto(List<TimeSlotViewDto> timeSlots) {
        this.timeSlots = timeSlots != null ? List.copyOf(timeSlots) : List.of();
    }

    @Override
    public List<TimeSlotViewDto> timeSlots() {
        return timeSlots;
    }
}
