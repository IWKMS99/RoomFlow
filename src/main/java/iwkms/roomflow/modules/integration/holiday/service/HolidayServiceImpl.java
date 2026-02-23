package iwkms.roomflow.modules.integration.holiday.service;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import iwkms.roomflow.modules.integration.holiday.config.HolidayApiProperties;
import iwkms.roomflow.modules.integration.holiday.dto.HolidayDto;
import iwkms.roomflow.modules.integration.holiday.dto.NagerHolidayDto;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
@Slf4j
public class HolidayServiceImpl implements HolidayService {

    private final RestClient holidayRestClient;
    private final HolidayApiProperties properties;

    @Override
    @Cacheable(cacheNames = "holidays", key = "#year + ':' + (#country == null ? '' : #country.toUpperCase())")
    @CircuitBreaker(name = "holidayApi", fallbackMethod = "fetchHolidaysFallback")
    @Retry(name = "holidayApi")
    public List<HolidayDto> getHolidays(int year, String country) {
        String resolvedCountry = normalizeCountry(country);
        NagerHolidayDto[] response = holidayRestClient
                .get()
                .uri("/api/v3/PublicHolidays/{year}/{country}", year, resolvedCountry)
                .retrieve()
                .body(NagerHolidayDto[].class);

        if (response == null || response.length == 0) {
            return List.of();
        }

        return Arrays.stream(response)
                .map(item -> new HolidayDto(item.date(), item.localName(), item.name(), item.countryCode()))
                .toList();
    }

    @Override
    public boolean isHoliday(LocalDate date, String country) {
        return getHolidays(date.getYear(), country).stream()
                .anyMatch(holiday -> holiday.date().equals(date));
    }

    @SuppressWarnings("unused")
    private List<HolidayDto> fetchHolidaysFallback(int year, String country, Throwable throwable) {
        String reason =
                throwable == null ? "unknown" : throwable.getClass().getSimpleName() + ": " + throwable.getMessage();
        log.warn("Holiday API fallback for year={}, country={}, reason={}", year, country, reason);
        return Collections.emptyList();
    }

    private String normalizeCountry(String country) {
        if (country == null || country.isBlank()) {
            return properties.defaultCountry().toUpperCase(Locale.ROOT);
        }
        return country.toUpperCase(Locale.ROOT);
    }
}
