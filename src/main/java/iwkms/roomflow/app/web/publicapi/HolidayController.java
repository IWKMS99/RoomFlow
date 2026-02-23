package iwkms.roomflow.app.web.publicapi;

import iwkms.roomflow.modules.integration.holiday.dto.HolidayDto;
import iwkms.roomflow.modules.integration.holiday.service.HolidayService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/holidays")
@RequiredArgsConstructor
@Slf4j
public class HolidayController {

    private final HolidayService holidayService;

    @GetMapping
    public ResponseEntity<List<HolidayDto>> getHolidays(
            @RequestParam int year, @RequestParam(required = false, defaultValue = "RU") String country) {
        try {
            return ResponseEntity.ok(holidayService.getHolidays(year, country));
        } catch (RuntimeException ex) {
            log.warn("Holiday endpoint fallback to empty list for year={}, country={}", year, country, ex);
            return ResponseEntity.ok(List.of());
        }
    }
}
