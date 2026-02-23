package iwkms.roomflow.modules.integration.holiday.dto;

import java.time.LocalDate;

public record HolidayDto(LocalDate date, String localName, String name, String countryCode) {}
