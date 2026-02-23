package iwkms.roomflow.modules.integration.holiday.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "holiday.api")
public record HolidayApiProperties(String baseUrl, int timeoutMs, String defaultCountry) {}
