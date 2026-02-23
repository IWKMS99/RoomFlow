package iwkms.roomflow.modules.integration.holiday.service;

import iwkms.roomflow.modules.integration.holiday.dto.HolidayDto;
import java.time.LocalDate;
import java.util.List;

public interface HolidayService {

    List<HolidayDto> getHolidays(int year, String country);

    boolean isHoliday(LocalDate date, String country);
}
